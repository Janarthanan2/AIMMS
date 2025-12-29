from transformers import DonutProcessor, VisionEncoderDecoderModel
from PIL import Image
import torch
import re
import io
import json

# --- Configuration ---
MODEL_REPO = "naver-clova-ix/donut-base-finetuned-cord-v2"

print(f"Loading Donut model: {MODEL_REPO}...")
# Load Processor and Model
# Note: This might take a while on first run as it downloads ~1-2GB
processor = DonutProcessor.from_pretrained(MODEL_REPO)
model = VisionEncoderDecoderModel.from_pretrained(MODEL_REPO)

device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)
print(f"Donut model loaded on {device}.")

def extract_with_donut(image_bytes):
    """
    Extracts structured data from a receipt image using the Donut model.
    """
    try:
        # 1. Load Image
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # 2. Preprocess
        pixel_values = processor(image, return_tensors="pt").pixel_values
        pixel_values = pixel_values.to(device)
        
        # 3. Generate Output
        task_prompt = "<s_cord-v2>" # The prompt used during fine-tuning for CORD dataset
        decoder_input_ids = processor.tokenizer(task_prompt, add_special_tokens=False, return_tensors="pt").input_ids
        decoder_input_ids = decoder_input_ids.to(device)
        
        outputs = model.generate(
            pixel_values,
            decoder_input_ids=decoder_input_ids,
            max_length=512,
            early_stopping=True,
            pad_token_id=processor.tokenizer.pad_token_id,
            eos_token_id=processor.tokenizer.eos_token_id,
            use_cache=True,
            num_beams=1,
            bad_words_ids=[[processor.tokenizer.unk_token_id]],
            return_dict_in_generate=True,
        )
        
        # 4. Post-process
        sequence = processor.batch_decode(outputs.sequences)[0]
        sequence = sequence.replace(processor.tokenizer.eos_token, "").replace(processor.tokenizer.pad_token, "")
        sequence = re.sub(r"<.*?>", "", sequence, count=1).strip()  # remove first task start token
        
        # Convert to JSON using the processor's helper (handles special CORD tokens)
        json_output = processor.token2json(sequence)
        
        # DEBUG: Print the raw JSON to terminal
        print("--- DONUT RAW OUTPUT ---")
        print(json.dumps(json_output, indent=2))
        print("------------------------")
        
        # 5. Map to our application's Standard Schema
        # Donut CORD output keys: 'menu' (list), 'total_price', 'sub_total', 'tax_price', etc.
        # Sometimes nested under 'receipt' or at root.
        
        # Helper to find value recursively or in common keys
        def find_value(data, keys):
            for k in keys:
                val = data.get(k)
                if val: return val
                # Check inside 'receipt' or 'store_info' if they exist
                if isinstance(data.get("receipt"), dict):
                    val = data["receipt"].get(k)
                    if val: return val
            return None

        merchant = find_value(json_output, ["store_name", "merchant_name", "name", "merchant", "store_addr"]) or \
                   json_output.get("store_info", {}).get("name")
        
        # Expanded synonyms for Date
        date_val = find_value(json_output, ["date", "receipt_date", "create_date", "issue_date", "bill_date", "purchase_date", "txn_date"])
        time_val = find_value(json_output, ["time", "receipt_time", "create_time", "bill_time"])
        
        # Bill Number often labeled as invoice_no, receipt_id, or just id
        bill_no = find_value(json_output, ["invoice_no", "receipt_id", "id", "serial_no"])

        # --- Hybrid Fallback: Use Regex if Donut missed specific fields ---
        
        # 1. Date Fallback
        if not date_val:
            # Matches: 12/12/2023, 12-12-2023, 2023-12-12
            numeric_date_pattern = r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})'
            
            # Matches: 12 Jan 2023, 12-Jan-2023, Jan 12, 2023
            text_date_pattern = r'(?i)(\d{1,2}[\s/\.\-](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s/\.\-,]*\d{2,4})'
            
            matches = re.search(numeric_date_pattern, sequence)
            if matches:
                date_val = matches.group(0)
            else:
                 matches = re.search(text_date_pattern, sequence)
                 if matches:
                     date_val = matches.group(0)

        # 2. Time Fallback
        if not time_val:
            # Matches 12:30, 12:30 PM, 12:30:45
            time_pattern = r'(\d{1,2}:\d{2}(?::\d{2})?\s?(?:AM|PM|am|pm)?)'
            time_match = re.search(time_pattern, sequence)
            if time_match:
                time_val = time_match.group(0)

        # 3. Total Amount Fallback (Critical)
        final_total = None
        try:
            # Try structured first
            total_str = json_output.get("total_price") or json_output.get("total", {}).get("total_price")
            if total_str:
                final_total = float(re.sub(r"[^0-9.]", "", str(total_str)))
        except:
             pass
        
        if final_total is None:
             # Try regex on the sequence
             total_pattern = r'(?i)(?:Total|Amount|Grand Total|Net Amount)[\s:]*?(\d+[.,]\d{2})'
             total_matches = re.findall(total_pattern, sequence)
             if total_matches:
                 try:
                    amounts = [float(m.replace(',', '')) for m in total_matches]
                    final_total = max(amounts) # Assumption: Max value is total
                 except:
                    pass

        mapped_data = {
            "merchant_name": merchant or "Unknown Merchant",
            "bill_number": bill_no, 
            "date": date_val,
            "time": time_val,
            "total_amount": final_total,
            "tax_amount": None,
            "items": [],
            "raw_text": [json.dumps(json_output, indent=2)] 
        }

        try:
            tax_str = json_output.get("tax_price") or json_output.get("sub_total", {}).get("tax_price")
            if tax_str:
                mapped_data["tax_amount"] = float(re.sub(r"[^0-9.]", "", str(tax_str)))
        except:
            pass
            
        return mapped_data

    except Exception as e:
        print(f"Error in Donut extraction: {e}")
        return {"error": str(e)}
