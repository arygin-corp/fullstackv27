import re
import zipfile
from io import BytesIO
from pathlib import Path
from xml.etree import ElementTree

from docx import Document as WordDocument
from openpyxl import load_workbook
from pptx import Presentation
from pypdf import PdfReader

LEARNING_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".odt", ".rtf", ".txt", ".md",
    ".xls", ".xlsx", ".csv", ".ods",
    ".ppt", ".pptx", ".odp",
    ".json", ".xml", ".yaml", ".yml", ".sql",
}

_TEXT_EXTENSIONS = {".txt", ".md", ".csv", ".json", ".xml", ".yaml", ".yml", ".sql"}
_ODF_EXTENSIONS = {".odt", ".ods", ".odp"}
_LEGACY_OFFICE = {".doc", ".ppt"}


def learning_accept():
    return ",".join(sorted(LEARNING_EXTENSIONS))


def load_text(source):
    name = getattr(source, "name", str(source))
    suffix = Path(name).suffix.lower()
    if suffix not in LEARNING_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {suffix or 'unknown'}.")
    data = _read_bytes(source)
    text = _extract(suffix, data)
    return text.strip()


def _read_bytes(source):
    if hasattr(source, "open"):
        source.open("rb")
        try:
            if hasattr(source, "seek"):
                source.seek(0)
            return source.read()
        finally:
            if hasattr(source, "close"):
                source.close()
    with open(source, "rb") as stream:
        return stream.read()


def _extract(suffix, data):
    if suffix == ".pdf":
        return "\n\n".join(page.extract_text() or "" for page in PdfReader(BytesIO(data)).pages)
    if suffix == ".docx":
        document = WordDocument(BytesIO(data))
        parts = [paragraph.text for paragraph in document.paragraphs]
        for table in document.tables:
            for row in table.rows:
                cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if cells:
                    parts.append("\t".join(cells))
        return "\n".join(parts)
    if suffix == ".xlsx":
        return _xlsx_text(data)
    if suffix == ".xls":
        return _xls_text(data)
    if suffix == ".pptx":
        return _pptx_text(data)
    if suffix == ".rtf":
        return _rtf_text(data)
    if suffix in _ODF_EXTENSIONS:
        return _odf_text(data)
    if suffix in _TEXT_EXTENSIONS:
        return data.decode("utf-8-sig", errors="replace")
    if suffix in _LEGACY_OFFICE:
        return _legacy_office_text(data)
    raise ValueError(f"Unsupported file type: {suffix}.")


def _xlsx_text(data):
    workbook = load_workbook(BytesIO(data), read_only=True, data_only=True)
    lines = []
    try:
        for sheet in workbook.worksheets:
            lines.append(sheet.title)
            for row in sheet.iter_rows(values_only=True):
                cells = [str(cell) for cell in row if cell not in (None, "")]
                if cells:
                    lines.append("\t".join(cells))
    finally:
        workbook.close()
    return "\n".join(lines)


def _xls_text(data):
    import xlrd
    book = xlrd.open_workbook(file_contents=data)
    lines = []
    for sheet in book.sheets():
        lines.append(sheet.name)
        for row_index in range(sheet.nrows):
            cells = [str(value) for value in sheet.row_values(row_index) if value not in ("", None)]
            if cells:
                lines.append("\t".join(cells))
    return "\n".join(lines)


def _pptx_text(data):
    presentation = Presentation(BytesIO(data))
    lines = []
    for number, slide in enumerate(presentation.slides, 1):
        lines.append(f"Slide {number}")
        for shape in slide.shapes:
            if getattr(shape, "has_text_frame", False):
                text = shape.text_frame.text.strip()
                if text:
                    lines.append(text)
    return "\n".join(lines)


def _odf_text(data):
    with zipfile.ZipFile(BytesIO(data)) as package:
        xml = package.read("content.xml")
    root = ElementTree.fromstring(xml)
    return "\n".join(part.strip() for part in root.itertext() if part and part.strip())


def _rtf_text(data):
    text = data.decode("latin-1", errors="replace")
    text = re.sub(r"\\'([0-9a-fA-F]{2})", lambda match: bytes.fromhex(match.group(1)).decode("latin-1", errors="replace"), text)
    text = text.replace("\\par", "\n").replace("\\tab", "\t")
    text = re.sub(r"\\[a-zA-Z]+-?\d* ?", "", text)
    return re.sub(r"[{}]", "", text)


def _legacy_office_text(data):
    found = []
    seen = set()
    for encoding in ("utf-16le", "utf-8"):
        decoded = data.decode(encoding, errors="ignore")
        for match in re.findall(r"[A-Za-z0-9][A-Za-z0-9\s,.;:!?()'\"/%-]{7,}", decoded):
            cleaned = " ".join(match.split())
            if cleaned.casefold() not in seen:
                seen.add(cleaned.casefold())
                found.append(cleaned)
    return "\n".join(found)
