from io import BytesIO
from pathlib import Path
from tempfile import NamedTemporaryFile

from django.test import SimpleTestCase
from docx import Document as WordDocument

from apps.knowledge.loaders import LEARNING_EXTENSIONS, load_text


class LearningLoaderTests(SimpleTestCase):
    def test_listed_extensions_are_accepted(self):
        expected = {
            ".pdf", ".doc", ".docx", ".odt", ".rtf", ".txt", ".md",
            ".xls", ".xlsx", ".csv", ".ods",
            ".ppt", ".pptx", ".odp",
            ".json", ".xml", ".yaml", ".yml", ".sql",
        }
        self.assertEqual(LEARNING_EXTENSIONS, expected)

    def test_plain_and_word_text_are_extracted(self):
        self.assertIn("marketplace", load_text(_named("note.txt", b"Data marketplace access")))
        document = WordDocument()
        document.add_paragraph("Vikki learning note")
        buffer = BytesIO()
        document.save(buffer)
        self.assertIn("Vikki learning note", load_text(_named("note.docx", buffer.getvalue())))


def _named(name, data):
    handle = NamedTemporaryFile(suffix=Path(name).suffix, delete=False)
    handle.write(data)
    handle.close()
    return handle.name
