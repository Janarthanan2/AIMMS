from transformers import DistilBertTokenizerFast
import os

MODEL_DIR = './'
BERT_PATH = f'{MODEL_DIR}distilbert_transaction_model'

def export_tokenizer():
    print(f"Loading tokenizer from {BERT_PATH}...")
    # Use Fast tokenizer to get tokenizer.json
    tokenizer = DistilBertTokenizerFast.from_pretrained(BERT_PATH)
    
    output_path = f'{MODEL_DIR}tokenizer.json'
    tokenizer.save_vocabulary(MODEL_DIR) # Saves vocab.txt
    tokenizer.save_pretrained(MODEL_DIR) # Saves tokenizer.json and config
    
    print(f"Tokenizer exported to {MODEL_DIR}")

if __name__ == "__main__":
    export_tokenizer()
