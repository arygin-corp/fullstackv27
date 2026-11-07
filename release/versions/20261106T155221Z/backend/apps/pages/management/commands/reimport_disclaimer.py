from __future__ import annotations

import hashlib
import html
import re
from pathlib import Path

from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import Max

from apps.pages.content_rendering import validate_block_payload
from apps.pages.models import ContentBlock, Page, PageVersion


SECTION_LABELS = {
    0: "Disclaimer Header",
    1: "1. Acceptable Use of Information and Technology",
    2: "2. Terms of Use",
    3: "3. Mobile Services and Applications",
    4: "4. Third-Party Products, Services, and Links",
    5: "5. Indemnity and Hold Harmless",
    6: "6. Disclaimer of Warranties",
    7: "7. Limitation of Liabilities and Release",
    8: "8. Disputes and Arbitration",
    9: "9. Miscellaneous",
}

HEADING_RE = re.compile(
    r'<h1\b[^>]*class=["\'][^"\']*legal-title[^"\']*["\'][^>]*>'
    r'\s*([1-9])\.\s*(.*?)</h1>',
    flags=re.IGNORECASE | re.DOTALL,
)

def checksum(block_type: str, content: str) -> str:
    return hashlib.sha256(
        f"{block_type}\0{content}".encode("utf-8")
    ).hexdigest()


def decode_source(value: str) -> str:
    decoded = html.unescape(value)
    decoded = (decoded.replace(r"\<", "<").replace(r"\>", ">"))

    return decoded.strip()


def strip_outer_container(value: str) -> str:
    """Remove the one legacy container that surrounds all numbered sections."""
    value = value.strip()
    opening = re.compile(
        r'^<div\b[^>]*class=["\'][^"\']*\bcontainer\b[^"\']*["\'][^>]*>',
        flags=re.IGNORECASE,
    )
    value = opening.sub("", value, count=1).strip()
    if re.search(r'</div>\s*$', value, flags=re.IGNORECASE):
        value = re.sub(r'</div>\s*$', "", value, count=1, flags=re.IGNORECASE)
    return value.strip()


def split_document(source: str) -> list[tuple[int, str]]:
    matches = list(HEADING_RE.finditer(source))
    if len(matches) != 9:
        raise CommandError(
            f"Expected exactly 9 numbered legal sections, found {len(matches)}. "
            "Import was not changed."
        )

    numbers = [int(match.group(1)) for match in matches]
    if numbers != list(range(1, 10)):
        raise CommandError(
            f"Expected section numbers 1 through 9 in order, found {numbers}."
        )

    header = source[: matches[0].start()].strip()
    if not header:
        raise CommandError("The disclaimer header could not be identified.")

    sections: list[tuple[int, str]] = [(0, header)]
    for index, match in enumerate(matches):
        number = int(match.group(1))
        end = matches[index + 1].start() if index + 1 < len(matches) else len(source)
        section = source[match.start():end].strip()
        if number == 1:
            section = strip_outer_container(section)
        if number == 9:
            section = re.sub(r'</div>\s*$', "", section, count=1, flags=re.IGNORECASE).strip()
        sections.append(
            (number, f'<div class="container">\n{section}\n</div>')
        )
    return sections


class Command(BaseCommand):
    help = (
        "Re-import a Disclaimer HTML file as ten governed ContentBlock records "
        "while preserving allowed CSS classes."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "html_file",
            help="Path to the original disclaimer HTML file.",
        )
        parser.add_argument("--slug", default="disclaimer")
        parser.add_argument("--locale", default="en-US")
        parser.add_argument(
            "--replace-version",
            type=int,
            help=(
                "Replace blocks in this version number. A database backup table "
                "is not created; use only after taking a database backup."
            ),
        )
        parser.add_argument(
            "--publish",
            action="store_true",
            help="Publish the newly created version after validation.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Parse and sanitize the file without changing the database.",
        )

    def handle(self, *args, **options):
        source_path = Path(options["html_file"]).expanduser().resolve()
        if not source_path.is_file():
            raise CommandError(f"HTML file not found: {source_path}")

        source = decode_source(source_path.read_text(encoding="utf-8"))
        sections = split_document(source)

        sanitized: list[tuple[int, str, str]] = []
        for position, raw_content in sections:
            payload = validate_block_payload(
                ContentBlock.Type.HTML,
                {"content": raw_content},
            )
            content = payload["content"]
            sanitized.append((position, SECTION_LABELS[position], content))

        self._validate_sanitized(sanitized)

        if options["dry_run"]:
            self.stdout.write(
                self.style.SUCCESS(
                    "Dry run passed: 10 blocks parsed, sanitized, and validated."
                )
            )
            for position, label, content in sanitized:
                self.stdout.write(f"{position}: {label} ({len(content)} characters)")
            return

        with transaction.atomic():
            page = (
                Page.objects
                .select_for_update(of=("self",))
                .select_related("some_nullable_relation")
                .get(
                    slug=options["slug"],
                    locale=options["locale"],
                )
            )

            if not page.page_type.allow_restricted_html:
                raise CommandError(
                    f'Page type "{page.page_type}" does not allow restricted HTML.'
                )

            version = self._select_version(page, options)

            existing_count = version.blocks.count()
            if options["replace_version"]:
                version.blocks.all().delete()

            ContentBlock.objects.bulk_create(
                [
                    ContentBlock(
                        version=version,
                        block_type=ContentBlock.Type.HTML,
                        label=label,
                        position=position,
                        payload={"content": content},
                        checksum=checksum(ContentBlock.Type.HTML, content),
                        is_enabled=True,
                    )
                    for position, label, content in sanitized
                ]
            )

            inserted = version.blocks.count()
            if inserted != 10:
                raise CommandError(
                    f"Expected 10 stored blocks after import; found {inserted}."
                )

            if options["publish"]:
                if page.published_version_id and page.published_version_id != version.id:
                    PageVersion.objects.filter(pk=page.published_version_id).update(
                        status=PageVersion.Status.SUPERSEDED
                    )
                version.status = PageVersion.Status.PUBLISHED
                version.save(update_fields=("status", "updated_at"))
                page.published_version = version
                page.working_version = None
                page.save(
                    update_fields=(
                        "published_version",
                        "working_version",
                        "updated_at",
                    )
                )
            elif not options["replace_version"]:
                page.working_version = version
                page.save(update_fields=("working_version", "updated_at"))

        action = "replaced" if options["replace_version"] else "created"
        self.stdout.write(
            self.style.SUCCESS(
                f"Disclaimer version {version.number} {action} with 10 blocks. "
                f"Previous block count in the target version: {existing_count}. "
                f"Published: {'yes' if options['publish'] else 'no'}."
            )
        )

    def _select_version(self, page: Page, options) -> PageVersion:
        replace_number = options["replace_version"]
        if replace_number is not None:
            try:
                return page.versions.select_for_update().get(number=replace_number)
            except PageVersion.DoesNotExist as exc:
                raise CommandError(
                    f"Version {replace_number} does not exist for {page.slug}."
                ) from exc

        number = (page.versions.aggregate(value=Max("number"))["value"] or 0) + 1
        return PageVersion.objects.create(
            page=page,
            number=number,
            title=page.title,
            summary="Disclaimer HTML re-import with preserved CSS classes",
            status=PageVersion.Status.DRAFT,
            created_by=None,
        )

    def _validate_sanitized(self, sections):
        if len(sections) != 10:
            raise CommandError(
                f"Expected 10 blocks, found {len(sections)}."
            )

        by_position = {
            position: content
            for position, _, content in sections
        }

        header = by_position[0]

        # Print the actual sanitized result when validation fails.
        def require_header_text(fragment: str) -> None:
            if fragment not in header:
                raise CommandError(
                    "Sanitization removed required header markup: "
                    f"{fragment}\n\n"
                    "SANITIZED HEADER:\n"
                    f"{header}"
                )

        def require_header_pattern(
                description: str,
                pattern: str,
        ) -> None:
            if not re.search(
                    pattern,
                    header,
                    flags=re.IGNORECASE | re.DOTALL,
            ):
                raise CommandError(
                    f"Sanitization removed {description}.\n"
                    f"Expected regex: {pattern}\n\n"
                    "SANITIZED HEADER:\n"
                    f"{header}"
                )

        require_header_text(
            'class="jumbotron jumbotron-fluid"'
        )

        require_header_text(
            'class="lead text-center"'
        )

        section_requirements = {
            1: [
                'class="legal-title text-center"',
                'class="legal-subtitle"',
                'class="legal-paragraph"',
                'class="table"',
            ],
            2: [
                'class="legal-title text-center"',
                'class="legal-paragraph"',
            ],
            3: [
                'class="legal-title text-center"',
                'class="legal-paragraph"',
            ],
            4: [
                'class="legal-title text-center"',
                'class="legal-paragraph"',
            ],
            5: [
                'class="legal-title text-center"',
                'class="legal-paragraph"',
            ],
            6: [
                'class="legal-title text-center"',
                'class="legal-paragraph"',
            ],
            7: [
                'class="legal-title text-center"',
                'class="legal-paragraph"',
            ],
            8: [
                'class="legal-title text-center"',
                'class="legal-paragraph"',
            ],
            9: [
                'class="legal-title text-center"',
                'class="legal-paragraph"',
            ],
        }

        for position, fragments in section_requirements.items():
            if position not in by_position:
                raise CommandError(
                    f"Missing expected block at position {position}."
                )

            content = by_position[position]

            for fragment in fragments:
                if fragment not in content:
                    raise CommandError(
                        "Sanitization removed required markup "
                        f"from block {position}: {fragment}\n\n"
                        "SANITIZED BLOCK:\n"
                        f"{content}"
                    )

        forbidden_patterns = {
            "script element": r"<\s*script\b",
            "iframe element": r"<\s*iframe\b",
            "object element": r"<\s*object\b",
            "embed element": r"<\s*embed\b",
            "JavaScript URL": r"javascript\s*:",
            "event-handler attribute": (
                r"\s+on(?:load|click|error|mouseover|focus)\s*="
            ),
        }

        for position, content in by_position.items():
            for description, pattern in forbidden_patterns.items():
                if re.search(
                        pattern,
                        content,
                        flags=re.IGNORECASE,
                ):
                    raise CommandError(
                        f"Unsafe {description} remained "
                        f"in block {position}."
                    )

        return True