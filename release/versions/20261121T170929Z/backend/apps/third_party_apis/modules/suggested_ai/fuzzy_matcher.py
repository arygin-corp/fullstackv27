
import re
from rapidfuzz import process, fuzz

# Optional: Normalize input to improve matching accuracy
def clean_text(text):
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)  # Normalize multiple spaces
    text = re.sub(r'[^\w\s]', '', text)  # Remove punctuation
    return text.strip()

# Main function to get best match
def get_best_match(user_input, choices, threshold=70):
    cleaned_input = clean_text(user_input)
    cleaned_choices = [clean_text(choice) for choice in choices]

    # Match using RapidFuzz
    match, score, index = process.extractOne(
        cleaned_input,
        cleaned_choices,
        scorer=fuzz.token_sort_ratio
    )

    # Return original choice if score is above threshold
    if score >= threshold:
        return {
            "match": choices[index],
            "score": score
        }
    else:
        return {
            "match": None,
            "score": score
        }

# Example usage
if __name__ == "__main__":
    known_values = [
        "Toyota Camry", "Honda Accord", "Ford Mustang", "Chevrolet Malibu"
    ]
    user_input = "Toyta Camary"

    result = get_best_match(user_input, known_values)
    if result["match"]:
        print(f"Best match: {result['match']} (Score: {result['score']})")
    else:
        print("No good match found.")
