from fuzzywuzzy import fuzz
import re

MOCK_DB_DOCUMENT_NUMBERS = {"426494775044", "ABCDE1234F"} 

def get_name_match_score(name_from_doc, name_from_user_input):
    """Calculates a similarity score between two names (0-100)."""
    if not name_from_doc or not name_from_user_input:
        return 0
    return fuzz.token_sort_ratio(name_from_doc, name_from_user_input)

def check_for_duplicates(doc_number):
    """Checks if a document number has been used before."""
    return doc_number in MOCK_DB_DOCUMENT_NUMBERS if doc_number else False

def is_valid_aadhaar(number):
    """Validates Aadhaar number format. A full Verhoeff check is more complex."""
    return isinstance(number, str) and len(number) == 12 and number.isdigit()

def calculate_fraud_score(name_match_score, is_duplicate, doc_status):
    """Calculates a fraud risk score and provides reasons."""
    score = 5 # Start with a low base score
    reasons = []
    
    # Rule 1: Name Mismatch (High Impact)
    if name_match_score < 80:
        # The lower the score, the higher the penalty
        score += (100 - name_match_score) * 0.6 
        reasons.append(f"Name match is low ({name_match_score}%).")

    # Rule 2: Duplicate Document (Very High Impact)
    if is_duplicate:
        score += 70
        reasons.append("This document number may have been used before.")

    # Rule 3: Invalid Document Number (High Impact)
    if doc_status == "Invalid":
        score += 50
        reasons.append("The document number format is invalid.")
    
    if not reasons:
        reasons.append("No major risk factors detected.")

    return {"score": min(int(score), 100), "reasons": reasons}