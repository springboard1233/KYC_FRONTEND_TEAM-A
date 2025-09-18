from fuzzywuzzy import fuzz
import re

MOCK_DB_DOCUMENT_NUMBERS = {"426494775044", "ABCDE1234F", "918428418860", "938859257853", "253748923436", "425171345737", "620357622014"} 

def get_name_match_score(name_from_doc, name_from_user_input):
    if not name_from_doc or not name_from_user_input:
        return 0
    return fuzz.token_sort_ratio(name_from_doc, name_from_user_input)

def check_for_duplicates(doc_number):
    return doc_number in MOCK_DB_DOCUMENT_NUMBERS if doc_number else False

def is_valid_aadhaar(number):
    return isinstance(number, str) and len(number) == 12 and number.isdigit()

def calculate_fraud_score(name_match_score, is_duplicate, doc_status):
    score = 5 
    reasons = []
    
    if name_match_score < 80:
        score += (100 - name_match_score) * 0.6 
        reasons.append(f"Name match is low ({name_match_score}%).")

    if is_duplicate:
        score += 70
        reasons.append("This document number may have been used before.")

    if doc_status == "Invalid":
        score += 50
        reasons.append("The document number format is invalid.")
    
    if not reasons:
        reasons.append("No major risk factors detected.")

    return {"score": min(int(score), 100), "reasons": reasons}