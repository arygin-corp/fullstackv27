import json
import os

# --- Part 1: Extract 'adgroup' values from products 1.json ---

def extract_adgroups(input_file: str, output_file: str):
    """Extracts 'adgroup' values from products with datatype 'Datasets'."""
    with open(input_file, encoding='utf-8') as f:
        products = json.load(f)

    adgroups = [
        product.get('adgroup')
        for product in products
        if product.get('datatype') == 'Datasets'
    ]

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(adgroups, f, indent=4)

# --- Part 2: Combine multiple JSON files into one master file ---

def combine_json_files(folder_path: str, output_file: str):
    """Combines all JSON files in a folder into a single JSON array."""
    master_data = []

    for filename in os.listdir(folder_path):
        if filename.endswith('.json'):
            file_path = os.path.join(folder_path, filename)
            try:
                with open(file_path, 'r', encoding='utf-8') as json_file:
                    data = json.load(json_file)
                    master_data.append(data)
            except json.JSONDecodeError:
                print(f"Error decoding JSON from file: {filename}")

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(master_data, f, indent=4)

# --- Example usage ---

if __name__ == "__main__":
    extract_adgroups('products 1.json', 'adgroups.json')

    folder_path = 'C:/Users/632224/PycharmProjects/SearchEngine/jsonFiles'
    output_file = 'master.json'
    combine_json_files(folder_path, output_file)
