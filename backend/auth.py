from flask import jsonify, request
from flask_bcrypt import Bcrypt
import jwt
import datetime
from bson.objectid import ObjectId

def init_auth(mongo_instance, bcrypt_instance, app_instance):
    global mongo, bcrypt, app
    mongo = mongo_instance
    bcrypt = bcrypt_instance
    app = app_instance

def register_user():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if mongo.db.users.find_one({"email": email}):
        return jsonify({"error": "Email already in use"}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    user_id = mongo.db.users.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password,
        "createdAt": datetime.datetime.utcnow()
    }).inserted_id

    new_user = mongo.db.users.find_one({"_id": user_id})

    # Prepare user data for the response (excluding password)
    user_data = {
        "_id": str(new_user["_id"]),
        "name": new_user["name"],
        "email": new_user["email"],
    }
    return jsonify({"message": "User registered successfully", "user": user_data}), 201

def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = mongo.db.users.find_one({"email": email})

    if user and bcrypt.check_password_hash(user['password'], password):
        token = jwt.encode({
            'id': str(user['_id']),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        user_data = {
            "_id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
        }
        return jsonify({"message": "Login successful", "user": user_data, "token": token}), 200

    return jsonify({"error": "Invalid credentials"}), 401