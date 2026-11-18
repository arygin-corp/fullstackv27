from django.http import JsonResponse
from django.urls import reverse
from django.views.decorators.http import require_GET


def _date(value):
    if not value:
        return ""
    return value.strftime("%B %-d, %Y")


SITE_MENU = (
    ("leadership", "Leadership"),
    ("roadmap", "Roadmap"),
    ("hackathon", "Hackathon"),
    ("campaign", "Campaign"),
    ("newsroom", "Newsroom"),
    ("resources", "Resources"),
    ("faqs", "FAQs"),
    ("support", "Support"),
    ("whats-new", "What's New"),
)


def _file_url(field):
    if not field:
        return ""
    try:
        return field.url
    except ValueError:
        return ""


@require_GET
def index(request):
    names = (
        "leadership",
        "roadmap",
        "hackathon",
        "campaign",
        "newsroom",
        "resources",
        "faqs",
        "support",
        "whats-new",
    )
    return JsonResponse({name: reverse(f"site_content:{name}") for name in names})


PAGE_VIEWS = {}


@require_GET
def leadership(request):
    from apps.third_party_apis.modules.internal_teams.models import TeamMember, TeamPage

    page = TeamPage.objects.filter(is_active=True).order_by("id").first()
    members = TeamMember.objects.filter(is_active=True).order_by("position", "id")
    return JsonResponse({
        "title": page.title if page else "Leadership",
        "description": page.description if page else "",
        "members": [
            {
                "id": member.id,
                "name": member.name,
                "role": member.role,
                "image": member.image,
            }
            for member in members
        ],
    })


@require_GET
def roadmap(request):
    from apps.third_party_apis.modules.roadmap.models import RoadmapMilestone, RoadmapPage

    page = RoadmapPage.objects.filter(is_active=True).order_by("id").first()
    rows = RoadmapMilestone.objects.filter(is_active=True).order_by(
        "fiscal_start_year", "quarter", "month_index", "position", "id"
    )
    years = []
    current = None
    for row in rows:
        if current is None or current["fiscalStartYear"] != row.fiscal_start_year:
            current = {"fiscalStartYear": row.fiscal_start_year, "quarters": []}
            years.append(current)
        quarter = next((item for item in current["quarters"] if item["quarter"] == row.quarter), None)
        if quarter is None:
            quarter = {"quarter": row.quarter, "milestones": []}
            current["quarters"].append(quarter)
        quarter["milestones"].append({
            "id": row.id,
            "monthIndex": row.month_index,
            "monthName": row.month_name,
            "title": row.title,
            "description": row.description,
        })
    return JsonResponse({
        "title": page.title if page else "Product Roadmap",
        "description": page.description if page else "",
        "years": years,
    })


@require_GET
def hackathon(request):
    from apps.third_party_apis.modules.hackathon.models import (
        HackathonClip,
        HackathonGalleryItem,
        HackathonLink,
        HackathonLogo,
        HackathonPage,
        HackathonScore,
        HackathonSection,
        HackathonTag,
    )

    page = HackathonPage.objects.filter(is_active=True).order_by("-year").first()
    if page is None:
        return JsonResponse({"detail": "Hackathon page not found."}, status=404)
    sections = []
    for section in HackathonSection.objects.filter(is_active=True).order_by("position", "id"):
        sections.append({
            "key": section.key,
            "kicker": section.kicker,
            "title": section.title,
            "lead": section.lead,
            "mark": section.mark,
            "paragraphs": section.paragraphs,
            "quote": section.quote,
            "bullets": section.bullets,
            "image": section.image,
            "caption": section.caption,
            "links": [
                {"label": link.label, "url": link.url, "kind": link.kind}
                for link in HackathonLink.objects.filter(section=section, is_active=True).order_by("position", "id")
            ],
        })
    return JsonResponse({
        "year": page.year,
        "logoKicker": page.logo_kicker,
        "title": page.title,
        "video": page.video,
        "lines": page.lines,
        "registrationTitle": page.registration_title,
        "registrationUrl": page.registration_url,
        "faqLabel": page.faq_label,
        "faqUrl": page.faq_url,
        "faqDownload": page.faq_download,
        "hostsLabel": page.hosts_label,
        "hostsImage": page.hosts_image,
        "hostsImageAlt": page.hosts_image_alt,
        "logos": [
            {"placement": logo.placement, "name": logo.name, "image": logo.image}
            for logo in HackathonLogo.objects.filter(is_active=True).order_by("placement", "position", "id")
        ],
        "scores": [
            {"label": score.label, "value": score.value}
            for score in HackathonScore.objects.filter(is_active=True).order_by("position", "id")
        ],
        "groups": list(
            HackathonTag.objects.filter(is_active=True, kind=HackathonTag.Kind.GROUP)
            .order_by("position", "id")
            .values_list("label", flat=True)
        ),
        "partners": list(
            HackathonTag.objects.filter(is_active=True, kind=HackathonTag.Kind.PARTNER)
            .order_by("position", "id")
            .values_list("label", flat=True)
        ),
        "gallery": list(
            HackathonGalleryItem.objects.filter(is_active=True).order_by("position", "id").values_list("label", flat=True)
        ),
        "videos": [
            {"title": clip.title, "text": clip.text, "cta": clip.cta, "url": clip.url}
            for clip in HackathonClip.objects.filter(is_active=True).order_by("position", "id")
        ],
        "sections": sections,
    })


@require_GET
def campaign(request):
    from apps.third_party_apis.modules.campaign_page.models import CampaignAd

    payload = {"slides": [], "brands": [], "highlights": [], "banners": []}
    keys = {
        CampaignAd.Kind.SLIDE: "slides",
        CampaignAd.Kind.BRAND: "brands",
        CampaignAd.Kind.HIGHLIGHT: "highlights",
        CampaignAd.Kind.BANNER: "banners",
    }
    for ad in CampaignAd.objects.filter(is_active=True).order_by("kind", "position", "id"):
        payload[keys[ad.kind]].append({
            "title": ad.title,
            "text": ad.text,
            "image": ad.image,
            "fragment": ad.fragment,
            "link": ad.link,
            "icon": ad.icon,
            "actionLabel": ad.action_label,
        })
    return JsonResponse(payload)


def _news_post(post):
    return {
        "id": post.source_id,
        "title": post.title,
        "slug": post.slug,
        "summary": post.summary,
        "content": post.content,
        "image": post.image,
        "author": post.author,
        "authorImage": post.author_image,
        "date": _date(post.published_on),
        "publishedOn": post.published_on.isoformat() if post.published_on else None,
        "category": post.category,
    }


@require_GET
def newsroom(request):
    from apps.third_party_apis.modules.blog_news.models import NewsPost

    rows = NewsPost.objects.filter(is_active=True).order_by("source_id")
    category = (request.GET.get("category") or "").strip()
    if category:
        rows = rows.filter(category=category)
    posts = [_news_post(post) for post in rows]
    return JsonResponse({"count": len(posts), "results": posts})


@require_GET
def newsroom_post(request, slug):
    from apps.third_party_apis.modules.blog_news.models import NewsPost

    post = NewsPost.objects.filter(is_active=True, slug=slug).first()
    if post is None:
        return JsonResponse({"detail": "Newsroom post not found.", "slug": slug}, status=404)
    return JsonResponse(_news_post(post))


def _library_item(item, kind):
    return {
        "id": item.id,
        "kind": kind,
        "heading": item.name,
        "details": item.desc or "",
        "imageUrl": _file_url(getattr(item, "cover", None) or getattr(item, "image", None)),
        "icon": _file_url(getattr(item, "platform", None) or getattr(item, "icon", None)),
        "classification": getattr(item, "classification", ""),
        "size": item.size or "",
        "format": item.file_format or "",
        "linkUrl": getattr(item, "view_url", "") or getattr(item, "external_url", "") or "",
        "downloadUrl": item.download_url or "",
    }


@require_GET
def resources(request):
    from apps.resources.models import Brand, Document, Homepage, Media, Policie, Processe

    page = Homepage.objects.filter(is_active=True, is_archived=False).order_by("id").first()
    documents = Document.objects.filter(is_active=True, is_archived=False).order_by("id")
    policies = Policie.objects.filter(is_active=True, is_archived=False).order_by("id")
    processes = Processe.objects.filter(is_active=True, is_archived=False).order_by("id")
    brands = Brand.objects.filter(is_active=True, is_archived=False).order_by("id")
    media = Media.objects.filter(is_active=True, is_archived=False).order_by("id")
    return JsonResponse({
        "title": page.title if page else "Resource Library",
        "subtitle": page.sub_title if page else "",
        "description": page.desc if page else "",
        "banner": _file_url(page.hero_image) if page else "",
        "documents": [_library_item(item, "document") for item in documents],
        "policies": [_library_item(item, "policy") for item in policies],
        "processes": [_library_item(item, "process") for item in processes],
        "brands": [
            {
                "id": brand.id,
                "name": brand.name,
                "image": _file_url(brand.image),
                "size": brand.size or "",
                "description": brand.desc or "",
                "downloadUrl": brand.download_url or "",
            }
            for brand in brands
        ],
        "media": [
            {
                "id": item.id,
                "name": item.name,
                "file": _file_url(item.media),
                "icon": _file_url(item.icon),
                "size": item.size or "",
                "format": item.file_format or "",
                "date": item.date.isoformat() if item.date else None,
                "downloadUrl": item.download_url or "",
            }
            for item in media
        ],
    })


@require_GET
def faqs(request):
    from apps.third_party_apis.modules.faqs.models import FaqSection

    sections = []
    for section in FaqSection.objects.prefetch_related("items").order_by("position", "id"):
        sections.append({
            "title": section.title,
            "items": [
                {"question": item.question, "answer": item.answer}
                for item in section.items.filter(is_active=True).order_by("position", "id")
            ],
        })
    return JsonResponse({"sections": sections})


def _support_article(article):
    return {
        "id": article.source_id,
        "category": article.category.source_id,
        "title": article.title,
        "summary": article.summary,
        "blocks": article.blocks,
        "image": article.image,
        "walkthrough": article.walkthrough,
    }


@require_GET
def support(request):
    from apps.third_party_apis.modules.support_help_platform.models import (
        SupportArticle,
        SupportCategory,
        SupportPrompt,
    )

    category = (request.GET.get("category") or "").strip()
    articles = SupportArticle.objects.filter(is_active=True).select_related("category").order_by("position", "id")
    if category and category != "all":
        articles = articles.filter(category__source_id=category)
    return JsonResponse({
        "categories": [
            {
                "id": row.source_id,
                "label": row.label,
                "description": row.description,
                "icon": row.icon,
            }
            for row in SupportCategory.objects.order_by("position", "id")
        ],
        "prompts": [
            {"question": row.question, "answer": row.answer}
            for row in SupportPrompt.objects.filter(is_active=True).order_by("position", "id")
        ],
        "articles": [_support_article(article) for article in articles],
    })


@require_GET
def whats_new(request):
    from apps.third_party_apis.modules.whats_new.models import WalkthroughChrome, WalkthroughStep

    chrome = {
        row.layout: row.hotspots
        for row in WalkthroughChrome.objects.order_by("layout")
    }
    steps = []
    for step in WalkthroughStep.objects.filter(is_active=True).order_by("position", "id"):
        item = {
            "id": step.source_id,
            "title": step.title,
            "summary": step.summary,
            "link": step.link,
            "linkLabel": step.link_label,
            "image": step.image,
            "hotspots": step.hotspots,
        }
        if step.chrome_layout:
            item["chromeLayout"] = step.chrome_layout
        steps.append(item)
    return JsonResponse({
        "kicker": "What's New",
        "chrome": chrome,
        "steps": steps,
    })


@require_GET
def support_article(request, source_id):
    from apps.third_party_apis.modules.support_help_platform.models import SupportArticle

    article = (
        SupportArticle.objects.filter(is_active=True, source_id=source_id)
        .select_related("category")
        .first()
    )
    if article is None:
        return JsonResponse({"detail": "Support article not found.", "id": source_id}, status=404)
    return JsonResponse(_support_article(article))


PAGE_VIEWS.update({
    "leadership": leadership,
    "roadmap": roadmap,
    "hackathon": hackathon,
    "campaign": campaign,
    "newsroom": newsroom,
    "resources": resources,
    "faqs": faqs,
    "support": support,
    "whats-new": whats_new,
})
