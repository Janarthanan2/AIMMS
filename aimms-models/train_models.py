import pandas as pd
import numpy as np
import torch
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
import joblib
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification, Trainer, TrainingArguments
from torch.utils.data import Dataset

# --- Configuration ---
DATA_FILE = 'augmented_dataset.csv'
MODEL_DIR = './'
TEST_SIZE = 0.2
RANDOM_STATE = 42

# --- Data Loading ---
def load_data(filepath):
    df = pd.read_csv(filepath)
    df = df[['description', 'category']].dropna()
    return df

# --- Baseline: Logistic Regression ---
def train_logistic_regression(X_train, y_train, X_test, y_test):
    print("\n--- Training Logistic Regression ---")
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=5000)),
        ('clf', LogisticRegression(max_iter=1000))
    ])
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Logistic Regression Accuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred))
    joblib.dump(pipeline, f'{MODEL_DIR}logistic_regression_model.pkl')
    return pipeline, acc

# --- Traditional: XGBoost ---
def train_xgboost(X_train, y_train, X_test, y_test):
    print("\n--- Training XGBoost ---")
    le = LabelEncoder()
    y_train_enc = le.fit_transform(y_train)
    y_test_enc = le.transform(y_test)
    
    vectorizer = TfidfVectorizer(max_features=5000)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    clf = xgb.XGBClassifier(use_label_encoder=False, eval_metric='mlogloss')
    clf.fit(X_train_vec, y_train_enc)
    
    y_pred_enc = clf.predict(X_test_vec)
    acc = accuracy_score(y_test_enc, y_pred_enc)
    print(f"XGBoost Accuracy: {acc:.4f}")
    print(classification_report(y_test_enc, y_pred_enc, target_names=le.classes_))
    
    # Save components
    joblib.dump(clf, f'{MODEL_DIR}xgboost_model.pkl')
    joblib.dump(vectorizer, f'{MODEL_DIR}tfidf_vectorizer.pkl')
    joblib.dump(le, f'{MODEL_DIR}label_encoder.pkl')
    return clf, acc

# --- Deep Learning: DistilBERT ---
class TransactionDataset(Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)

def train_distilbert(X_train, y_train, X_test, y_test):
    print("\n--- Training DistilBERT ---")
    
    # Encode labels
    le = LabelEncoder()
    y_train_enc = le.fit_transform(y_train)
    y_test_enc = le.transform(y_test)
    num_labels = len(le.classes_)
    
    # Tokenization
    tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
    train_encodings = tokenizer(X_train.tolist(), truncation=True, padding=True, max_length=64)
    test_encodings = tokenizer(X_test.tolist(), truncation=True, padding=True, max_length=64)
    
    train_dataset = TransactionDataset(train_encodings, y_train_enc)
    test_dataset = TransactionDataset(test_encodings, y_test_enc)
    
    # Model
    model = DistilBertForSequenceClassification.from_pretrained('distilbert-base-uncased', num_labels=num_labels)
    
    # Training Arguments
    training_args = TrainingArguments(
        output_dir='./results',
        num_train_epochs=3,
        per_device_train_batch_size=16,
        per_device_eval_batch_size=64,
        warmup_steps=500,
        weight_decay=0.01,
        logging_dir='./logs',
        logging_steps=10,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        no_cuda=not torch.cuda.is_available() # Use CPU if CUDA not available
    )
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
    )
    
    trainer.train()
    
    # Evaluation
    eval_result = trainer.evaluate()
    print(f"DistilBERT Evaluation: {eval_result}")
    
    # Save
    model.save_pretrained(f'{MODEL_DIR}distilbert_transaction_model')
    tokenizer.save_pretrained(f'{MODEL_DIR}distilbert_transaction_model')
    joblib.dump(le, f'{MODEL_DIR}distilbert_label_encoder.pkl')
    
    return model, eval_result['eval_accuracy'] if 'eval_accuracy' in eval_result else 0.0

# --- Main ---
if __name__ == "__main__":
    df = load_data(DATA_FILE)
    X = df['description']
    y = df['category']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y)
    
    print(f"Training on {len(X_train)} samples, Testing on {len(X_test)} samples")
    
    # Train all
    lr_model, lr_acc = train_logistic_regression(X_train, y_train, X_test, y_test)
    xgb_model, xgb_acc = train_xgboost(X_train, y_train, X_test, y_test)
    
    # DistilBERT might take longer, so we run it last
    try:
        bert_model, bert_acc = train_distilbert(X_train, y_train, X_test, y_test)
    except Exception as e:
        print(f"DistilBERT training failed: {e}")
        bert_acc = 0.0

    print("\n--- Summary ---")
    print(f"Logistic Regression Accuracy: {lr_acc:.4f}")
    print(f"XGBoost Accuracy: {xgb_acc:.4f}")
    print(f"DistilBERT Accuracy: {bert_acc:.4f}")
