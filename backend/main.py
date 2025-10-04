# from fastapi import FastAPI, UploadFile, File, Form
# from fastapi.middleware.cors import CORSMiddleware
# import uvicorn
# import os
# import shutil

# # Import your existing, excellent logic files
# from ocr import process_document
# from verification import get_name_match_score, check_for_duplicates, is_valid_aadhaar, predict_fraud_risk

# app = FastAPI()
# app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# # --- AI Model Simulation ---
# def run_cnn_check(filepath: str) -> dict:
#     """Simulates a CNN model checking for physical document tampering."""
#     print("Simulating CNN Tampering Check...")
#     return {"is_tampered": False, "confidence": 0.98}

# def run_nlp_check(extracted_text: dict) -> dict:
#     """Simulates an NLP model checking for logical inconsistencies in text."""
#     print("Simulating NLP Consistency Check...")
#     return {"is_consistent": True, "confidence": 0.95}

# # --- API Endpoints ---
# @app.post("/validate_document")
# async def validate_document_endpoint(file: UploadFile = File(...)):
#     """Runs OCR, CNN, and NLP checks."""
#     filepath = f"temp_{file.filename}"
#     with open(filepath, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)
    
#     try:
#         extracted_text = process_document(filepath)
#         if "error" in extracted_text:
#             return {"status": "error", "message": extracted_text["error"]}
        
#         cnn_result = run_cnn_check(filepath)
#         nlp_result = run_nlp_check(extracted_text)
        
#         return {
#             "status": "success",
#             "extracted_text": extracted_text,
#             "validation": {
#                 "cnn_tampering_check": cnn_result,
#                 "nlp_consistency_check": nlp_result
#             }
#         }
#     finally:
#         if os.path.exists(filepath): os.remove(filepath)

# @app.post("/check_fraud")
# async def check_fraud_endpoint(name_on_doc: str = Form(...), user_name: str = Form(...), doc_number: str = Form(...)):
#     """Runs fraud checks like name matching and duplicate detection."""
#     name_score = get_name_match_score(name_on_doc, user_name)
#     is_duplicate = check_for_duplicates(doc_number)
#     is_valid_doc = is_valid_aadhaar(doc_number)
#     doc_status = "Valid" if is_valid_doc else "Invalid"

#     fraud_result = predict_fraud_risk(name_score, is_duplicate, doc_status)
    
#     return {
#         "status": "success",
#         "fraud_analysis": {
#             "name_match_score": name_score,
#             "is_duplicate_document": is_duplicate,
#             "final_fraud_score": fraud_result["score"],
#             "risk_reasons": fraud_result["reasons"]
#         }
#     }

# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=5001)

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import shutil

from ocr import process_document
from verification import get_name_match_score, check_for_duplicates, is_valid_aadhaar, predict_fraud_risk

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def run_cnn_check(filepath: str) -> dict:
    """Simulates a CNN model checking for physical document tampering."""
    print("Simulating CNN Tampering Check...")
    return {"is_tampered": False, "confidence": 0.98}

def run_nlp_check(extracted_text: dict) -> dict:
    """Simulates an NLP model checking for logical inconsistencies in text."""
    print("Simulating NLP Consistency Check...")
    return {"is_consistent": True, "confidence": 0.95}

@app.post("/api/analyze-document") # single endpoint for analysis
async def analyze_document_route(file: UploadFile = File(...), userEnteredName: str = Form(...)):
    filepath = f"temp_{file.filename}"
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        extracted_text = process_document(filepath)
        if "error" in extracted_text:
            return {"error": extracted_text["error"]}

        doc_number = extracted_text.get("AadhaarNumber") or extracted_text.get("PANNumber")
        doc_status = "Valid" if is_valid_aadhaar(doc_number) else "Invalid"
        
        name_score = get_name_match_score(extracted_text.get("Name"), userEnteredName)
        is_duplicate = check_for_duplicates(doc_number)
        fraud_result = predict_fraud_risk(name_score, is_duplicate, doc_status)
        
        return {
            "extractedText": extracted_text,
            "verification": {
                "documentStatus": doc_status,
                "nameMatchScore": name_score,
                "isDuplicate": is_duplicate,
                "fraudScore": fraud_result["score"],
                "reasons": fraud_result["reasons"]
            }
        }
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

@app.post("/check_fraud")
async def check_fraud_endpoint(name_on_doc: str = Form(...), user_name: str = Form(...), doc_number: str = Form(...)):
    """Runs fraud checks like name matching and duplicate detection."""
    name_score = get_name_match_score(name_on_doc, user_name)
    is_duplicate = check_for_duplicates(doc_number)
    is_valid_doc = is_valid_aadhaar(doc_number)
    doc_status = "Valid" if is_valid_doc else "Invalid"

    fraud_result = predict_fraud_risk(name_score, is_duplicate, doc_status)
    
    return {
        "status": "success",
        "fraud_analysis": {
            "name_match_score": name_score,
            "is_duplicate_document": is_duplicate,
            "final_fraud_score": fraud_result["score"],
            "risk_reasons": fraud_result["reasons"]
        }
    }            

@app.post("/validate_document")
async def validate_document_endpoint(file: UploadFile = File(...)):
    """Runs OCR, CNN, and NLP checks."""
    filepath = f"temp_{file.filename}"
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        extracted_text = process_document(filepath)
        if "error" in extracted_text:
            return {"status": "error", "message": extracted_text["error"]}
        
        cnn_result = run_cnn_check(filepath)
        nlp_result = run_nlp_check(extracted_text)
        
        return {
            "status": "success",
            "extracted_text": extracted_text,
            "validation": {
                "cnn_tampering_check": cnn_result,
                "nlp_consistency_check": nlp_result
            }
        }
    finally:
        if os.path.exists(filepath): os.remove(filepath)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)