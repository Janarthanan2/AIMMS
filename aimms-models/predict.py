import joblib
import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
import numpy as np

MODEL_DIR = './'

def load_models():
    print("Loading models...")
    # Load Logistic Regression
    lr_model = joblib.load(f'{MODEL_DIR}logistic_regression_model.pkl')
    
    # Load DistilBERT
    bert_path = f'{MODEL_DIR}distilbert_transaction_model'
    tokenizer = DistilBertTokenizer.from_pretrained(bert_path)
    bert_model = DistilBertForSequenceClassification.from_pretrained(bert_path)
    le = joblib.load(f'{MODEL_DIR}distilbert_label_encoder.pkl')
    
    return lr_model, tokenizer, bert_model, le

def predict_lr(model, text):
    return model.predict([text])[0]

def predict_bert(tokenizer, model, le, text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=64)
    with torch.no_grad():
        logits = model(**inputs).logits
    predicted_class_id = logits.argmax().item()
    return le.inverse_transform([predicted_class_id])[0]

if __name__ == "__main__":
    lr_model, tokenizer, bert_model, le = load_models()
    
    test_cases = [
        "Starbucks Coffee",
        "Uber Ride to Office",
        "Netflix Subscription",
        "Rent Payment for Oct",
        "Electricity Bill TNEB",
        "Salary Credited", # Unknown/Misc
        "Movie at PVR",
        "Medicine from Apollo",
        "Grocery from BigBasket"
    ]
    
    print("\n--- Predictions ---")
    print(f"{'Transaction':<25} | {'Logistic Regression':<20} | {'DistilBERT':<20}")
    print("-" * 70)
    
    for text in test_cases:
        pred_lr = predict_lr(lr_model, text)
        pred_bert = predict_bert(tokenizer, bert_model, le, text)
        print(f"{text:<25} | {pred_lr:<20} | {pred_bert:<20}")
