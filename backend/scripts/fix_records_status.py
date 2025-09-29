# fix_records_status.py
"""
Script to fix existing records in MongoDB:
- Ensures all records have status 'pending' if not 'approved' or 'rejected'.
- Ensures user_id is stored as ObjectId, not string.

Usage:
    python fix_records_status.py
"""

import os
from pymongo import MongoClient
from bson.objectid import ObjectId

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("MONGO_DB", "kyc_database")
COLLECTION = "records"


def fix_records():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    records = db[COLLECTION].find()
    fixed = 0
    for rec in records:
        update = {}
        # Fix status
        if rec.get("status") not in ["approved", "rejected"]:
            update["status"] = "pending"
        # Fix user_id type
        user_id = rec.get("user_id")
        if user_id and isinstance(user_id, str):
            try:
                update["user_id"] = ObjectId(user_id)
            except Exception:
                pass
        if update:
            db[COLLECTION].update_one({"_id": rec["_id"]}, {"$set": update})
            fixed += 1
    print(f"Fixed {fixed} records.")


if __name__ == "__main__":
    fix_records()
