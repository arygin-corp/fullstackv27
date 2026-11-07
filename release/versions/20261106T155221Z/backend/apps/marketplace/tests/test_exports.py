import json
import os
import tempfile
from pathlib import Path
from unittest.mock import patch

from django.test import SimpleTestCase

from apps.marketplace.utils import atomic_json_dump


class AtomicJsonExportTests(SimpleTestCase):
    def test_atomic_json_dump_replaces_target_with_valid_json(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "products.json"
            target.write_text('{"old": true}', encoding="utf-8")

            atomic_json_dump({"products": [1, 2]}, str(target), indent=2)

            self.assertEqual(json.loads(target.read_text(encoding="utf-8")), {"products": [1, 2]})
            self.assertEqual(list(Path(directory).glob("*.tmp")), [])

    def test_failed_replace_does_not_overwrite_existing_file(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "products.json"
            target.write_text('{"stable": true}', encoding="utf-8")

            with patch("apps.marketplace.utils.os.replace", side_effect=OSError("replace failed")):
                with self.assertRaises(OSError):
                    atomic_json_dump({"new": True}, str(target))

            self.assertEqual(json.loads(target.read_text(encoding="utf-8")), {"stable": True})
            self.assertFalse(any(name.endswith(".tmp") for name in os.listdir(directory)))
