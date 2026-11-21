from django.test import SimpleTestCase

from apps.third_party_apis.modules.vikki.chat.learning import is_follow_up, normalize_question, question_key, resolve_question


class LearnedQuestionTests(SimpleTestCase):
    def test_equivalent_questions_share_a_key(self):
        first = question_key("What training is required?")
        second = question_key("  what   training is required ")
        self.assertEqual(first, second)
        self.assertEqual(normalize_question("What training is required?"), "what training is required")

    def test_follow_up_keeps_the_previous_question(self):
        history = [
            {"role": "user", "content": "What training is required?"},
            {"role": "assistant", "content": "Training is required before access."},
        ]
        resolved = resolve_question("tell me more", history)
        self.assertTrue(is_follow_up("tell me more"))
        self.assertIn("What training is required?", resolved)
        self.assertIn("tell me more", resolved)
        self.assertIn("Training is required before access.", resolved)
        self.assertFalse(is_follow_up("What training is required?"))
        self.assertEqual(resolve_question("What training is required?", history), "What training is required?")
