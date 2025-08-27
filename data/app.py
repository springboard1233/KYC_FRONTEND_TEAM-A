from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all origins (for localhost testing)

@app.route('/api/kyc/upload', methods=['POST'])
def upload_file():
    if 'aadhaarFile' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['aadhaarFile']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Do minimal file validation if you want, or just accept
    # Normally here you'd do OCR or processing and return data
    dummy_data = {
        "name": "John Doe",
        "aadhaar_number": "1234-5678-9012",
        "dob": "1990-01-01",
        "address": "1234 Main St, City, Country"
    }

    return jsonify(dummy_data), 200

if __name__ == '__main__':
    app.run(port=5000, debug=True)
