import csv
from collections import Counter

def analyze_dataset(file_path):
    categories = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if 'category' in row:
                    categories.append(row['category'])
        
        counts = Counter(categories)
        print(f"Total records: {len(categories)}")
        print("Category distribution:")
        for cat, count in counts.most_common():
            print(f"{cat}: {count}")
            
    except FileNotFoundError:
        print(f"File not found: {file_path}")

if __name__ == "__main__":
    analyze_dataset('sample_dataset.csv')
