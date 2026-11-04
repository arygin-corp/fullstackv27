from pathlib import Path
from pypdf import PdfReader
from docx import Document as WordDocument


def load_text(source):
    name = getattr(source, "name", str(source))
    suffix = Path(name).suffix.lower()
    if hasattr(source, "open"):
        source.open("rb")
        stream = source.file
    else:
        stream = open(source, "rb")
    try:
        if suffix == ".pdf":
            return "\n\n".join(page.extract_text() or "" for page in PdfReader(stream).pages)
        if suffix == ".docx":
            return "\n".join(p.text for p in WordDocument(stream).paragraphs)
        if suffix in {".txt", ".md"}:
            data = stream.read()
            return data.decode("utf-8", errors="replace") if isinstance(data, bytes) else data
        raise ValueError(f"Unsupported file type: {suffix}. Use PDF, DOCX, TXT, or MD.")
    finally:
        if hasattr(source, "close"):
            source.close()
        else:
            stream.close()
