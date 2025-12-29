import torch
from transformers import DistilBertForSequenceClassification, DistilBertTokenizer
import joblib
import os

MODEL_DIR = './'
BERT_PATH = f'{MODEL_DIR}distilbert_transaction_model'
OUTPUT_PATH = f'{MODEL_DIR}transaction_model.pt'

import json

def export_model():
    print(f"Loading model from {BERT_PATH}...")
    model = DistilBertForSequenceClassification.from_pretrained(BERT_PATH)
    tokenizer = DistilBertTokenizer.from_pretrained(BERT_PATH)
    model.eval()
    
    # Load Label Encoder
    le = joblib.load(f'{MODEL_DIR}distilbert_label_encoder.pkl')
    labels = le.classes_.tolist()
    
    # Save labels to JSON
    with open(f'{MODEL_DIR}labels.json', 'w') as f:
        json.dump(labels, f)
    print(f"Labels exported to {MODEL_DIR}labels.json")

    # Create dummy input for tracing
    text = "Dummy transaction description"
    inputs = tokenizer(text, return_tensors="pt", padding="max_length", max_length=64, truncation=True)
    
    # We need to trace the model with example inputs
    # HuggingFace models usually take input_ids and attention_mask
    dummy_input = (inputs['input_ids'], inputs['attention_mask'])
    
    print("Tracing model...")
    try:
        traced_model = torch.jit.trace(model, dummy_input, strict=False)
        traced_model.save(OUTPUT_PATH)
        print(f"Model exported successfully to {OUTPUT_PATH}")
    except Exception as e:
        print(f"Failed to export model: {e}")

if __name__ == "__main__":
    export_model()
