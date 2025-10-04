# # backend/verification.py
# from fuzzywuzzy import fuzz
# import re
# import joblib
# import numpy as np

# # --- Your existing helper functions ---
# MOCK_DB_DOCUMENT_NUMBERS = {"426494775044", "ABCDE1234F", "918428418860"}

# def get_name_match_score(name_from_doc, name_from_user_input):
#     if not name_from_doc or not name_from_user_input:
#         return 0
#     return fuzz.token_sort_ratio(name_from_doc, name_from_user_input)

# def check_for_duplicates(doc_number):
#     return doc_number in MOCK_DB_DOCUMENT_NUMBERS if doc_number else False

# def is_valid_aadhaar(number):
#     # This is a placeholder for a full Verhoeff check
#     return isinstance(number, str) and len(number) == 12 and number.isdigit()

# # --- NEW AI MODEL PREDICTION FUNCTION ---

# # Load the trained AI model when the server starts
# try:
#     FRAUD_MODEL = joblib.load('fraud_model.joblib')
#     print("✅ Fraud detection model loaded successfully.")
# except FileNotFoundError:
#     FRAUD_MODEL = None
#     print("⚠️ WARNING: fraud_model.joblib not found. AI fraud detection will be disabled.")

# def predict_fraud_risk(name_match_score, is_duplicate, doc_status):
#     """
#     Uses the trained AI model to predict a fraud risk score.
#     """
#     if FRAUD_MODEL is None:
#         return {"score": 50, "reasons": ["AI model is not available."]}

#     # 1. Convert inputs into a format the model understands
#     is_doc_valid_int = 1 if doc_status == "Valid" else 0
#     is_duplicate_int = 1 if is_duplicate else 0
    
#     # 2. Create a NumPy array with the features in the correct order
#     features = np.array([[name_match_score, is_duplicate_int, is_doc_valid_int]])

#     # 3. Use the model to predict the probability of fraud (class 1)
#     probability_fraud = FRAUD_MODEL.predict_proba(features)[0][1]
    
#     # 4. Convert probability to a percentage score
#     risk_score = int(probability_fraud * 100)

#     # 5. Provide reasons based on the score
#     reasons = []
#     if risk_score > 70:
#         reasons.append("High risk of fraud detected by AI model.")
#     elif risk_score > 30:
#         reasons.append("Medium risk of fraud detected by AI model.")
#     else:
#         reasons.append("Low risk of fraud detected by AI model.")

#     return {"score": risk_score, "reasons": reasons}

from fuzzywuzzy import fuzz
import re
import joblib
import numpy as np

# --- Your existing helper functions (no changes) ---
MOCK_DB_DOCUMENT_NUMBERS = {"426494775044", "ABCDE1234F", "918428418860"}

def get_name_match_score(name_from_doc, name_from_user_input):
    if not name_from_doc or not name_from_user_input:
        return 0
    return fuzz.token_sort_ratio(name_from_doc, name_from_user_input)

def check_for_duplicates(doc_number):
    return doc_number in MOCK_DB_DOCUMENT_NUMBERS if doc_number else False

def is_valid_aadhaar(number):
    return isinstance(number, str) and len(number) == 12 and number.isdigit()

# --- CORRECTED AI MODEL PREDICTION FUNCTION ---

try:
    FRAUD_MODEL = joblib.load('fraud_model.joblib')
    print("✅ Fraud detection model loaded successfully.")
except FileNotFoundError:
    FRAUD_MODEL = None
    print("⚠️ WARNING: fraud_model.joblib not found. AI fraud detection will be disabled.")

def predict_fraud_risk(name_match_score, is_duplicate, doc_status):
    """
    Uses the trained AI model to predict a fraud score and
    generates specific, human-readable reasons for the score.
    """
    if FRAUD_MODEL is None:
        return {"score": 50, "reasons": ["AI model is not available."]}

    # Convert inputs for the AI model
    is_doc_valid_int = 1 if doc_status == "Valid" else 0
    is_duplicate_int = 1 if is_duplicate else 0
    
    features = np.array([[name_match_score, is_duplicate_int, is_doc_valid_int]])

    # Use the model to predict the probability of fraud
    probability_fraud = FRAUD_MODEL.predict_proba(features)[0][1]
    risk_score = int(probability_fraud * 100)

    # --- NEW: Generate Specific Reasons Based on Inputs ---
    reasons = []
    if is_duplicate:
        reasons.append("High Risk: Document number has been used before.")
    
    if doc_status == "Invalid":
        reasons.append("High Risk: Document number format is invalid.")

    if name_match_score < 80:
        reasons.append(f"Medium Risk: Name match score is low ({name_match_score}%).")

    # Add a default message if no specific high-risk flags were found
    if not reasons:
        reasons.append("Low Risk: No major inconsistencies detected.")
    # ----------------------------------------------------

    return {"score": risk_score, "reasons": reasons}