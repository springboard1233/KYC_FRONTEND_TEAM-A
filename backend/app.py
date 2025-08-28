import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

from ocr import extract_aadhaar_details

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

app.config['JSON_SORT_KEYS'] = False
CORS(app) 

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# API Endpoint
@app.route('/api/extract', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']

    # if filename is valid
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # if file type allowed and process it
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        
        # Create the upload folder if doesn't exist
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
            
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            # Call OCR
            extracted_data = extract_aadhaar_details(filepath)
            # print(jsonify(extracted_data),200)

            if not extracted_data:
                return jsonify({"error": "Could not extract details from the document"}), 500
            
            return jsonify(extracted_data), 200

        except Exception as e:
            return jsonify({"error": f"An internal error occurred: {e}"}), 500
        finally:
            if os.path.exists(filepath):
                os.remove(filepath)
    else:
        return jsonify({"error": "File type not allowed"}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5001)