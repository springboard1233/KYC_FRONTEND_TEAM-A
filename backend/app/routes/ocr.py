from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import logging
import traceback
from datetime import datetime
from ..utils.ocr import OCRProcessor
from ..models.record import Record
from ..utils.database import db

logger = logging.getLogger(__name__)

ocr_bp = Blueprint('ocr', __name__)

# Initialize OCR processor
ocr_processor = OCRProcessor()

def allowed_file(filename):
    """Check if uploaded file is allowed"""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
    return ('.' in filename and 
            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS)

@ocr_bp.route('/api/extract', methods=['POST', 'OPTIONS'])
@jwt_required()
def extract_document():
    """Extract data from uploaded document and optionally save record"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        logger.info("=== DOCUMENT EXTRACTION REQUEST ===")
        user_id = get_jwt_identity()
        logger.info(f"User: {user_id}")
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only PNG, JPG, JPEG, PDF allowed'}), 400
        
        # Get document type and options
        doc_type = request.form.get('doctype', '').lower()
        if doc_type not in ['aadhaar', 'pan']:
            return jsonify({'error': 'Document type must be either "aadhaar" or "pan"'}), 400
        
        save_record = request.form.get('save_record', 'true').lower() == 'true'
        
        logger.info(f"Processing {doc_type} document: {file.filename}, Save: {save_record}")
        
        # Save uploaded file
        original_filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{user_id}_{timestamp}_{original_filename}"
        
        upload_folder = current_app.config.get('UPLOAD_FOLDER', './uploads')
        os.makedirs(upload_folder, exist_ok=True)
        
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        
        logger.info(f"File saved: {file_path}")
        
        # Process document with OCR
        try:
            result = ocr_processor.process_document(file_path, doc_type)
            
            if not result['success']:
                # Clean up file on OCR failure
                if os.path.exists(file_path):
                    os.remove(file_path)
                
                return jsonify({
                    'error': 'OCR processing failed',
                    'details': result.get('error', 'Unknown error'),
                    'document_type': doc_type
                }), 422
            
            # Prepare response
            response_data = {
                'message': 'Document processed successfully',
                'extraction_result': {
                    'document_type': result['document_type'],
                    'extracted_fields': result['extracted_fields'],
                    'confidence_score': result['confidence_score'],
                    'processing_timestamp': result['processing_timestamp'],
                    'raw_text': result['raw_text'],
                    'filename': filename,
                    'original_filename': original_filename
                }
            }
            
            # Save as record if requested
            if save_record:
                try:
                    record = Record(
                        user_id=user_id,
                        document_type=result['document_type'],
                        extracted_fields=result['extracted_fields'],
                        raw_text=result['raw_text'],
                        confidence_score=result['confidence_score'],
                        filename=filename,
                        original_filename=original_filename
                    )
                    
                    record_id = record.save(db)
                    response_data['record_saved'] = True
                    response_data['record_id'] = str(record_id)
                    
                    logger.info(f"Record saved: {record_id}")
                    
                except Exception as save_error:
                    logger.error(f"Failed to save record: {str(save_error)}")
                    response_data['record_saved'] = False
                    response_data['save_error'] = str(save_error)
            else:
                response_data['record_saved'] = False
            
            # Clean up uploaded file (optional - keep for debugging)
            # os.remove(file_path)
            
            logger.info(f"OCR extraction successful for {doc_type}")
            return jsonify(response_data), 200
            
        except Exception as ocr_error:
            logger.error(f"OCR processing error: {str(ocr_error)}")
            logger.error(traceback.format_exc())
            
            # Clean up file on error
            if os.path.exists(file_path):
                os.remove(file_path)
            
            return jsonify({
                'error': 'OCR processing failed',
                'details': str(ocr_error),
                'document_type': doc_type
            }), 500
        
    except Exception as e:
        logger.error(f"Extract endpoint error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

# Keep existing test-ocr and ocr-info endpoints as they are
@ocr_bp.route('/api/test-ocr', methods=['POST'])
@jwt_required()
def test_ocr():
    """Test OCR functionality with synthetic documents"""
    try:
        data = request.get_json()
        
        if not data or 'image_path' not in data or 'doc_type' not in data:
            return jsonify({'error': 'image_path and doc_type required'}), 400
        
        image_path = data['image_path']
        doc_type = data['doc_type'].lower()
        
        if doc_type not in ['aadhaar', 'pan']:
            return jsonify({'error': 'doc_type must be aadhaar or pan'}), 400
        
        if not os.path.exists(image_path):
            return jsonify({'error': f'Image file not found: {image_path}'}), 404
        
        # Process document
        result = ocr_processor.process_document(image_path, doc_type)
        
        return jsonify(result), 200 if result['success'] else 422
        
    except Exception as e:
        logger.error(f"Test OCR error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ocr_bp.route('/api/ocr-info', methods=['GET'])
def ocr_info():
    """Get OCR system information"""
    try:
        import pytesseract
        
        info = {
            'tesseract_version': pytesseract.get_tesseract_version(),
            'supported_formats': ['PNG', 'JPG', 'JPEG', 'PDF'],
            'supported_documents': ['aadhaar', 'pan'],
            'max_file_size': '16MB',
            'processing_features': [
                'Text extraction',
                'Field parsing',
                'Confidence scoring',
                'Multiple preprocessing methods',
                'Automatic record saving'
            ]
        }
        
        return jsonify(info), 200
        
    except Exception as e:
        logger.error(f"OCR info error: {str(e)}")
        return jsonify({'error': str(e)}), 500
