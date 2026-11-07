# RAG evaluation dataset

Create a JSON array based on `ground_truth.example.json`. Each case requires a `question` and may contain exact `expected_document_titles`, `expected_document_ids`, and case-insensitive `expected_chunk_contains` values. The evaluator reports hit rate, mean reciprocal rank, recall, and average latency. Use questions and expected evidence reviewed by a domain expert. Do not treat generated answers as ground truth.
