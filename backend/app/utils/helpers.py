# backend/app/utils/helpers.py

from bson import ObjectId

def bson_to_json(data):
    """
    Recursively convert BSON (including ObjectId) to JSON-serializable dict or list.
    """
    if isinstance(data, list):
        return [bson_to_json(item) for item in data]
    elif isinstance(data, dict):
        return {k: bson_to_json(v) for k, v in data.items()}
    elif isinstance(data, ObjectId):
        return str(data)
    else:
        return data