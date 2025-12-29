import easyocr
import re
import numpy as np
import cv2
from PIL import Image
import io

# Initialize EasyOCR Reader
# 'en' for English. You can add other languages if needed.
reader = easyocr.Reader(['en'], gpu=False) 

def preprocess_image(image_np):
    """
    Applies preprocessing to improve OCR accuracy:
    1. Grayscale
    2. Noise Removal (Gaussian Blur)
    3. Adaptive Thresholding
    """
    # 1. Grayscale
    gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
    
    # 2. Noise Removal
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # 3. Thresholding (Binarization)
    # Uses adaptive thresholding to handle different lighting conditions
    processed = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    
    return processed

def extract_receipt_data(image_bytes):
    """
    Extracts structured data from a receipt image using EasyOCR and Regex.
    """
    try:
        # Convert bytes to image
        image = Image.open(io.BytesIO(image_bytes))
        image_np = np.array(image)
        
        # Preprocessing
        processed_img = preprocess_image(image_np)
        
        # Perform OCR
        # detail=0 returns just the text list. detail=1 returns coords, text, conf.
        results = reader.readtext(processed_img, detail=0)
        
        # Join all text for regex searching (sometimes easier)
        full_text = "\n".join(results)
        
        data = {
            "merchant_name": None,
            "bill_number": None,
            "date": None,
            "time": None,
            "total_amount": None,
            "tax_amount": None,
            "items": [], # Placeholder for Phase 2 or advanced parsing
            "raw_text": results
        }
        
        # --- Parsing Logic (Phase 1: Regex + Heuristics) ---
        
        # 1. Merchant Name: Usually the first non-empty line
        if results:
            data["merchant_name"] = results[0]

        # 2. Date
        # Matches: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, etc.
        date_pattern = r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})'
        date_match = re.search(date_pattern, full_text)
        if date_match:
            data["date"] = date_match.group(0)
            
        # 3. Time
        # Matches: HH:MM, HH:MM:SS, with optional AM/PM
        time_pattern = r'(\d{1,2}:\d{2}(?::\d{2})?\s?(?:AM|PM|am|pm)?)'
        time_match = re.search(time_pattern, full_text)
        if time_match:
            data["time"] = time_match.group(0)

        # 4. Total Amount
        # Look for keywords like "Total", "Amount", "Grand Total" followed by a number
        # We search specifically for the largest number associated with "Total" usually
        total_pattern = r'(?i)(?:Total|Amount|Grand Total|Net Amount)[\s:]*?(\d+[.,]\d{2})'
        total_matches = re.findall(total_pattern, full_text)
        if total_matches:
            # Take the last one found as it's often at the bottom, or the max value
            # Cleaning the string to float
            try:
                amounts = [float(m.replace(',', '')) for m in total_matches]
                data["total_amount"] = max(amounts)
            except:
                data["total_amount"] = total_matches[-1]

        # 5. Tax
        tax_pattern = r'(?i)(?:Tax|GST|VAT)[\s:]*?(\d+[.,]\d{2})'
        tax_matches = re.findall(tax_pattern, full_text)
        if tax_matches:
             try:
                amounts = [float(m.replace(',', '')) for m in tax_matches]
                data["tax_amount"] = max(amounts) # Assumption: Max tax found
             except:
                data["tax_amount"] = tax_matches[-1]
                
        # 6. Bill Number
        # Look for "Bill No", "Invoice No", "Inv No"
        bill_pattern = r'(?i)(?:Bill|Invoice|Inv)[\s\.]*(?:No|Num|#)?[\s:]*([A-Za-z0-9-]+)'
        bill_match = re.search(bill_pattern, full_text)
        if bill_match:
            data["bill_number"] = bill_match.group(1)

        return data

    except Exception as e:
        print(f"Error in OCR extraction: {e}")
        return {"error": str(e)}
