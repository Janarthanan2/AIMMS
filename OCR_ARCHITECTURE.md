# OCR System Architecture & Design

## 1. System Architecture

The system follows a modular microservice-based architecture to ensure scalability, ease of maintenance, and flexibility.

### **Pipeline Flow**
1.  **Frontend (React)**: User uploads a receipt (Image/PDF).
2.  **Backend (Spring Boot)**: Receives the file via REST API.
3.  **OCR Microservice (Python/FastAPI)**:
    *   Receives the image bytes.
    *   **Preprocessing**: Converts to grayscale, de-noises, de-skews.
    *   **Text Detection & Recognition**: Uses EasyOCR / PaddleOCR.
    *   **Parsing (NLP)**: Extracts tailored fields (Merchant, Date, Total, etc.) using Regex/NER.
    *   Returns structured JSON.
4.  **Backend (Spring Boot)**:
    *   Maps JSON to Java DTOs.
    *   Saves data to MySQL/MongoDB.
    *   Returns the result to the Frontend.
5.  **Analytics**: Backend aggregates data for dashboards.

### **Diagram (Conceptual)**

```mermaid
graph LR
    User[User (Mobile/Web)] -->|Upload Receipt| React[React Frontend]
    React -->|POST /api/ocr/upload| Boot[Spring Boot Backend]
    
    subgraph "Backend Services"
        Boot -->|Forward File| Python[Python OCR Service (FastAPI)]
        Python -->|Preprocess -> OCR -> NLP| Python
        Python -->|Structured JSON| Boot
        Boot -->|Save Transaction| DB[(Database MySQL/Mongo)]
    end
    
    subgraph "Analytics"
        Boot -->|Aggregated Reports| React
    end
```

## 2. Service Responsibilities

| Service | Technology | Responsibilities |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, Tailwind | UI for upload, crop, view results, edit parsed data, view dashboards. |
| **Backend API** | Java Spring Boot | Auth, API Gateway, Business Logic, DB Persistence, Forwarding to OCR. |
| **OCR Service** | Python, FastAPI, EasyOCR | Image Processing (OpenCV), OCR (EasyOCR/Paddle), Extraction (Regex/Transformers). |
| **Database** | MySQL / PostgreSQL | Storing users, transactions, and raw OCR data. |

## 3. API Contracts

### **1. Upload Receipt (Frontend -> Backend)**
*   **Endpoint**: `POST /api/ocr/upload`
*   **Content-Type**: `multipart/form-data`
*   **Payload**: `file` (Binary Image/PDF)
*   **Response**: `200 OK`
    ```json
    {
      "merchant": "Target",
      "date": "2023-10-25",
      "total": 45.99,
      ...
    }
    ```

### **2. Extract Receipt (Backend -> Python Service)**
*   **Endpoint**: `POST /extract/receipt`
*   **Content-Type**: `multipart/form-data`
*   **Payload**: `file` (Binary)
*   **Response**: `200 OK`
    ```json
    {
        "merchant_name": "Target",
        "total_amount": 45.99,
        "tax_amount": 3.40,
        "date": "2023-10-25",
        "raw_text": ["Target", "123 Main St", ...]
    }
    ```

## 4. Model Selection Rationale

### **OCR Engine**
*   **Selected**: **EasyOCR** (Phase 1)
*   **Why**: Lightweight, supports 80+ languages, good accuracy on scene text, easy to deploy without heavy GPU dependencies compared to Tesseract.
*   **Alternative**: **PaddleOCR** (Better for tables/layout), **Donut** (End-to-end JSON).

### **Information Extraction**
*   **Phase 1**: **Regex + Heuristics**. effective for strictly formatted bills. The current implementation uses this.
*   **Phase 2**: **DistilBERT / LayoutLM**. Will be used for semantic classification of tokens (e.g., distinguishing "Total" from line item prices) and bounding-box aware extraction.

## 5. Deployment & Scalability

*   **Docker**: Each service (Frontend, Backend, OCR) should have its own `Dockerfile`.
*   **Compose**: Use `docker-compose.yml` for local orchestration.
*   **Scaling**: The Python service is stateless and CPU-bound; it can be scaled horizontally behind a load balancer (Nginx/Traefik).

---
**Status**:
*   Python OCR Service: **Implemented (running on port 8000)**
*   Spring Boot Controller: **Implemented**
*   Frontend: **Ready to integrate**
