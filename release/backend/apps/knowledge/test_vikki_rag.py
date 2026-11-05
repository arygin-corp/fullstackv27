from unittest.mock import MagicMock, patch

from django.test import SimpleTestCase

from apps.knowledge.retrieval import RetrievedChunk
from apps.knowledge.vikki import answer_vikki, page_suggestions, reply_actions


class _Provider:
    def __init__(self):
        self.messages = []

    def complete(self, messages):
        self.messages = messages
        return "Training is required [Source 1]"


class VikkiRagChatTests(SimpleTestCase):
    def test_answer_is_grounded_in_retrieved_chunks(self):
        chunk = RetrievedChunk(
            chunk_id=1,
            document_id=9,
            document_title="Access policy",
            content="Training is required before access.",
            position=0,
            vector_score=0.9,
        )
        provider = _Provider()
        session = MagicMock()
        session.current_product = None
        with patch("apps.third_party_apis.modules.vikki.chat.learning.recall", return_value=(None, None)), \
             patch("apps.third_party_apis.modules.vikki.chat.learning.remember"), \
             patch("apps.knowledge.vikki.marketplace_context", return_value={}), \
             patch("apps.knowledge.vikki.recommend_products", return_value=[]), \
             patch("apps.knowledge.vikki.record_activity"), \
             patch("apps.knowledge.vikki.proactive_suggestions", return_value=[]), \
             patch("apps.third_party_apis.modules.vikki.chat.services.retrieve_chunks", return_value=[chunk]), \
             patch("apps.third_party_apis.modules.vikki.chat.services.memory_prompt_block", return_value=""), \
             patch("apps.third_party_apis.modules.vikki.chat.services.graph_context", return_value=("", [])), \
             patch("apps.third_party_apis.modules.vikki.chat.services.get_chat_provider", return_value=provider):
            result = answer_vikki(MagicMock(), "What training is required?", session=session, history=[])
        prompt = "\n".join(message.content for message in provider.messages)
        self.assertIn("[Source 1]", prompt)
        self.assertIn("Training is required before access.", prompt)
        self.assertEqual(result["answer"], "Training is required [Source 1]")
        self.assertEqual(result["citations"][0]["document_id"], 9)
        self.assertEqual(result["citations"][0]["title"], "Access policy")
        self.assertEqual(result["citations"][0]["excerpt"], "Training is required before access.")
        self.assertFalse(result["cached"])

    def test_a_known_question_returns_the_recorded_answer(self):
        recorded = {
            "answer": "Training is required before access.",
            "citations": [{"document_id": 9, "title": "Access policy"}],
            "recommendations": [],
            "suggestions": [],
            "cached": True,
        }
        session = MagicMock()
        with patch("apps.third_party_apis.modules.vikki.chat.learning.recall", return_value=(recorded, None)), \
             patch("apps.knowledge.vikki.proactive_suggestions", return_value=[{"title": "Find a product", "prompt": "Help"}]), \
             patch("apps.knowledge.vikki.record_activity"), \
             patch("apps.third_party_apis.modules.vikki.chat.services.prepare_answer") as prepare:
            result = answer_vikki(MagicMock(), "What training is required?", session=session)
        prepare.assert_not_called()
        self.assertTrue(result["cached"])
        self.assertEqual(result["answer"], "Training is required before access.")

    def test_follow_up_is_resolved_before_retrieval(self):
        recorded = {
            "answer": "Here is more detail.",
            "citations": [],
            "recommendations": [],
            "suggestions": [],
            "cached": True,
        }
        history = [
            MagicMock(role="user", content="What training is required?"),
            MagicMock(role="assistant", content="Training is required before access."),
        ]
        session = MagicMock()
        with patch("apps.third_party_apis.modules.vikki.chat.learning.recall", return_value=(recorded, None)) as recall, \
             patch("apps.knowledge.vikki.proactive_suggestions", return_value=[]), \
             patch("apps.knowledge.vikki.record_activity"), \
             patch("apps.third_party_apis.modules.vikki.chat.services.prepare_answer") as prepare:
            answer_vikki(MagicMock(), "tell me more", session=session, history=history)
        resolved = recall.call_args.args[1]
        self.assertIn("What training is required?", resolved)
        self.assertIn("tell me more", resolved)
        self.assertFalse(recall.call_args.kwargs["allow_similar"])
        prepare.assert_not_called()


class VikkiPageActionTests(SimpleTestCase):
    def test_page_and_reply_actions_follow_the_current_product(self):
        suggestions = page_suggestions({"product_name": "Customer Orders", "route": "/marketplace/product/customer-orders"})
        self.assertEqual(suggestions[0]["title"], "Explain this product")
        self.assertIn("Customer Orders", suggestions[1]["prompt"])
        actions = reply_actions(
            {"citations": [{"title": "Access policy"}], "recommendations": [{"product": {"id": 4, "name": "Orders"}}]},
            {"product_name": "Customer Orders"},
        )
        self.assertEqual(actions[0]["title"], "Explain the source")
        self.assertEqual(actions[1]["url"], "/marketplace/products/4/")
        self.assertIn("Customer Orders", actions[2]["prompt"])
