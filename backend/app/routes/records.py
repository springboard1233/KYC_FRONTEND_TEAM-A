from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import logging
import traceback
from datetime import datetime
from bson.objectid import ObjectId
from ..models.record import Record
from ..models.user import User
from ..utils.database import db

logger = logging.getLogger(__name__)

records_bp = Blueprint('records', __name__)

@records_bp.route('/api/records', methods=['POST', 'OPTIONS'])
@jwt_required()
def save_record():
    """Save OCR extraction result as a record"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        logger.info("=== SAVE RECORD REQUEST ===")
        user_id = get_jwt_identity()
        logger.info(f"User: {user_id}")
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['document_type', 'extracted_fields', 'confidence_score', 'filename']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            return jsonify({
                'error': 'Missing required fields',
                'missing_fields': missing_fields
            }), 400
        
        # Create record
        record = Record(
            user_id=user_id,
            document_type=data['document_type'],
            extracted_fields=data['extracted_fields'],
            raw_text=data.get('raw_text', ''),
            confidence_score=data['confidence_score'],
            filename=data['filename'],
            original_filename=data.get('original_filename', data['filename'])
        )
        
        # Save to database
        record_id = record.save(db)
        
        logger.info(f"Record saved successfully: {record_id}")
        
        return jsonify({
            'message': 'Record saved successfully',
            'record_id': str(record_id),
            'record': record.to_dict()
        }), 201
        
    except Exception as e:
        logger.error(f"Save record error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Failed to save record',
            'details': str(e)
        }), 500

@records_bp.route('/api/records', methods=['GET'])
@jwt_required()
def list_records():
    """List user's records with pagination and filtering"""
    
    try:
        logger.info("=== LIST RECORDS REQUEST ===")
        user_id = get_jwt_identity()
        
        # Get query parameters
        page = int(request.args.get('page', 1))
        per_page = min(int(request.args.get('per_page', 10)), 100)  # Max 100 per page
        
        # Get filters
        filters = {}
        if request.args.get('document_type'):
            filters['document_type'] = request.args.get('document_type').lower()
        
        if request.args.get('status'):
            filters['status'] = request.args.get('status')
        
        if request.args.get('min_confidence'):
            try:
                filters['min_confidence'] = float(request.args.get('min_confidence'))
            except ValueError:
                pass
        
        logger.info(f"Filters: {filters}, Page: {page}, Per page: {per_page}")
        
        # Find records
        records, total_count = Record.find_by_user(db, user_id, filters, page, per_page)
        
        # Convert to dictionaries
        records_data = [record.to_dict() for record in records]
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        
        response_data = {
            'records': records_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_count': total_count,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            },
            'filters': filters
        }
        
        logger.info(f"Found {len(records_data)} records (total: {total_count})")
        
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"List records error: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Failed to list records',
            'details': str(e)
        }), 500

@records_bp.route('/api/records/<record_id>', methods=['GET'])
@jwt_required()
def get_record(record_id):
    """Get a specific record"""
    
    try:
        user_id = get_jwt_identity()
        
        # Find record
        record = Record.find_by_id(db, record_id, user_id)
        
        if not record:
            return jsonify({'error': 'Record not found'}), 404
        
        return jsonify({'record': record.to_dict()}), 200
        
    except Exception as e:
        logger.error(f"Get record error: {str(e)}")
        return jsonify({
            'error': 'Failed to get record',
            'details': str(e)
        }), 500

@records_bp.route('/api/records/<record_id>', methods=['PUT'])
@jwt_required()
def update_record(record_id):
    """Update a record's status or notes"""
    
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Find record
        record = Record.find_by_id(db, record_id, user_id)
        
        if not record:
            return jsonify({'error': 'Record not found'}), 404
        
        # Update status if provided
        if 'status' in data:
            allowed_statuses = ['processed', 'verified', 'rejected']
            if data['status'] not in allowed_statuses:
                return jsonify({
                    'error': 'Invalid status',
                    'allowed_statuses': allowed_statuses
                }), 400
            
            record.update_status(db, data['status'], data.get('notes'))
        
        return jsonify({
            'message': 'Record updated successfully',
            'record': record.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Update record error: {str(e)}")
        return jsonify({
            'error': 'Failed to update record',
            'details': str(e)
        }), 500

@records_bp.route('/api/records/<record_id>', methods=['DELETE'])
@jwt_required()
def delete_record(record_id):
    """Delete a record"""
    
    try:
        user_id = get_jwt_identity()
        
        # Find and verify ownership
        record = Record.find_by_id(db, record_id, user_id)
        
        if not record:
            return jsonify({'error': 'Record not found'}), 404
        
        # Delete record
        records_collection = db.get_collection('records')
        result = records_collection.delete_one({'_id': ObjectId(record_id), 'user_id': ObjectId(user_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Record not found or not authorized'}), 404
        
        logger.info(f"Record deleted: {record_id}")
        
        return jsonify({'message': 'Record deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Delete record error: {str(e)}")
        return jsonify({
            'error': 'Failed to delete record',
            'details': str(e)
        }), 500

@records_bp.route('/api/records/stats', methods=['GET'])
@jwt_required()
def get_record_stats():
    """Get user's record statistics"""
    
    try:
        user_id = get_jwt_identity()
        
        records_collection = db.get_collection('records')
        
        # Aggregate statistics
        pipeline = [
            {'$match': {'user_id': ObjectId(user_id)}},
            {
                '$group': {
                    '_id': None,
                    'total_records': {'$sum': 1},
                    'aadhaar_count': {
                        '$sum': {'$cond': [{'$eq': ['$document_type', 'aadhaar']}, 1, 0]}
                    },
                    'pan_count': {
                        '$sum': {'$cond': [{'$eq': ['$document_type', 'pan']}, 1, 0]}
                    },
                    'verified_count': {
                        '$sum': {'$cond': [{'$eq': ['$status', 'verified']}, 1, 0]}
                    },
                    'avg_confidence': {'$avg': '$confidence_score'}
                }
            }
        ]
        
        result = list(records_collection.aggregate(pipeline))
        
        if result:
            stats = result[0]
            stats.pop('_id')  # Remove the None _id
            stats['avg_confidence'] = round(stats.get('avg_confidence', 0), 2)
        else:
            stats = {
                'total_records': 0,
                'aadhaar_count': 0,
                'pan_count': 0,
                'verified_count': 0,
                'avg_confidence': 0
            }
        
        return jsonify({'stats': stats}), 200
        
    except Exception as e:
        logger.error(f"Get stats error: {str(e)}")
        return jsonify({
            'error': 'Failed to get statistics',
            'details': str(e)
        }), 500
