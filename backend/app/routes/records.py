# routes/records.py - Enhanced Record Management Routes for AI-Powered KYC System

from flask import Blueprint, request, jsonify, current_app, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
import traceback
import io
import csv
from datetime import datetime, timedelta
from bson.objectid import ObjectId

# Configure logging
logger = logging.getLogger(__name__)

records_bp = Blueprint('records', __name__)

# ================================
# 📋 RECORDS LISTING AND FILTERING
# ================================

@records_bp.route('/api/records', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_user_records():
    """
    📋 Get paginated and filtered user records with comprehensive analytics
    
    Query Parameters:
    - page: Page number (default: 1)
    - per_page: Records per page (default: 10, max: 100)
    - type: Document type filter (aadhaar, pan)
    - risk: Risk category filter (low, medium, high)
    - status: Status filter (processed, verified, rejected)
    - admin_reviewed: Admin review status (true, false)
    - search: Search in names and filenames
    - sort_by: Sort field (processed_at, fraud_score, confidence_score)
    - sort_order: Sort direction (asc, desc)
    - date_from: Filter from date (YYYY-MM-DD)
    - date_to: Filter to date (YYYY-MM-DD)
    """
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        user_id = get_jwt_identity()
        logger.info(f"📋 Fetching records for user: {user_id}")
        
        # Parse query parameters with validation
        page = max(1, int(request.args.get('page', 1)))
        per_page = min(100, max(1, int(request.args.get('per_page', 10))))
        
        # Build filters
        filters = {}
        
        # Document type filter
        doc_type = request.args.get('type', '').lower()
        if doc_type in ['aadhaar', 'pan']:
            filters['document_type'] = doc_type
        
        # Risk category filter
        risk_category = request.args.get('risk', '').lower()
        if risk_category in ['low', 'medium', 'high']:
            filters['risk_category'] = risk_category
        
        # Status filter
        status = request.args.get('status', '').lower()
        if status in ['processed', 'verified', 'rejected', 'flagged']:
            filters['status'] = status
        
        # Admin review filter
        admin_reviewed = request.args.get('admin_reviewed', '').lower()
        if admin_reviewed in ['true', 'false']:
            filters['admin_reviewed'] = admin_reviewed == 'true'
        
        # Minimum confidence filter
        min_confidence = request.args.get('min_confidence', type=float)
        if min_confidence is not None and 0 <= min_confidence <= 100:
            filters['min_confidence'] = min_confidence
        
        # Date range filters
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        if date_from:
            try:
                filters['date_from'] = datetime.fromisoformat(date_from)
            except ValueError:
                return jsonify({
                    'error': 'Invalid date_from format',
                    'message': 'Use YYYY-MM-DD format'
                }), 400
        
        if date_to:
            try:
                filters['date_to'] = datetime.fromisoformat(date_to)
            except ValueError:
                return jsonify({
                    'error': 'Invalid date_to format', 
                    'message': 'Use YYYY-MM-DD format'
                }), 400
        
        # Search filter
        search = request.args.get('search', '').strip()
        if search:
            filters['search'] = search
        
        # Sorting
        sort_by = request.args.get('sort_by', 'processed_at')
        sort_order = request.args.get('sort_order', 'desc')
        
        if sort_by not in ['processed_at', 'fraud_score', 'confidence_score', 'created_at']:
            sort_by = 'processed_at'
        
        if sort_order not in ['asc', 'desc']:
            sort_order = 'desc'
        
        sort_direction = 1 if sort_order == 'asc' else -1
        
        # Fetch records from database
        from ..utils.database import db
        from ..models.record import EnhancedRecord
        
        records, total_count = EnhancedRecord.find_by_user(
            db=db,
            user_id=user_id,
            filters=filters,
            page=page,
            per_page=per_page,
            sort_by=sort_by,
            sort_order=sort_direction
        )
        
        # Convert records to dict format
        records_data = []
        for record in records:
            record_dict = record.to_dict(include_id=True, for_api=False)
            records_data.append(record_dict)
        
        # Calculate pagination info
        total_pages = (total_count + per_page - 1) // per_page
        has_next = page < total_pages
        has_prev = page > 1
        
        # Generate summary statistics for current filter
        if records:
            fraud_scores = [r.fraud_analysis.get('fraud_score', 0) for r in records]
            confidence_scores = [r.confidence_score for r in records]
            
            summary_stats = {
                'total_records': total_count,
                'current_page_count': len(records),
                'avg_fraud_score': round(sum(fraud_scores) / len(fraud_scores), 1) if fraud_scores else 0,
                'avg_confidence_score': round(sum(confidence_scores) / len(confidence_scores), 1) if confidence_scores else 0,
                'high_risk_count': len([r for r in records if r.fraud_analysis.get('risk_category') == 'high']),
                'verified_count': len([r for r in records if r.validation.get('is_valid', False)]),
                'admin_reviewed_count': len([r for r in records if r.admin_reviewed])
            }
        else:
            summary_stats = {
                'total_records': 0,
                'current_page_count': 0,
                'avg_fraud_score': 0,
                'avg_confidence_score': 0,
                'high_risk_count': 0,
                'verified_count': 0,
                'admin_reviewed_count': 0
            }
        
        response_data = {
            'success': True,
            'records': records_data,
            'pagination': {
                'current_page': page,
                'per_page': per_page,
                'total_pages': total_pages,
                'total_count': total_count,
                'has_next': has_next,
                'has_prev': has_prev,
                'next_page': page + 1 if has_next else None,
                'prev_page': page - 1 if has_prev else None
            },
            'filters_applied': {
                'document_type': filters.get('document_type'),
                'risk_category': filters.get('risk_category'),
                'status': filters.get('status'),
                'admin_reviewed': filters.get('admin_reviewed'),
                'search': filters.get('search'),
                'date_range': {
                    'from': date_from,
                    'to': date_to
                }
            },
            'sorting': {
                'sort_by': sort_by,
                'sort_order': sort_order
            },
            'summary_stats': summary_stats
        }
        
        logger.info(f"✅ Retrieved {len(records_data)} records for user {user_id}")
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching records: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Failed to fetch records',
            'message': 'An error occurred while retrieving your records'
        }), 500

# ================================
# 📊 RECORDS STATISTICS
# ================================

@records_bp.route('/api/records/stats', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_records_statistics():
    """📊 Get comprehensive user record statistics for dashboard"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        user_id = get_jwt_identity()
        logger.info(f"📊 Generating statistics for user: {user_id}")
        
        from ..utils.database import db
        
        # Get user statistics from database
        stats = db.get_user_stats(user_id)
        
        # Add additional computed statistics
        if stats.get('total_records', 0) > 0:
            # Calculate additional metrics
            records_collection = db.get_collection('records')
            
            # Recent activity (last 7 days)
            recent_cutoff = datetime.utcnow() - timedelta(days=7)
            recent_count = records_collection.count_documents({
                'user_id': ObjectId(user_id) if isinstance(user_id, str) else user_id,
                'processed_at': {'$gte': recent_cutoff}
            })
            
            # Manipulation detection stats
            manipulation_detected = records_collection.count_documents({
                'user_id': ObjectId(user_id) if isinstance(user_id, str) else user_id,
                'manipulation_result.manipulation_detected': True
            })
            
            # Name matching success rate
            name_matching_success = records_collection.count_documents({
                'user_id': ObjectId(user_id) if isinstance(user_id, str) else user_id,
                'name_matching_result.is_match': True
            })
            
            stats.update({
                'recent_submissions': recent_count,
                'manipulation_detected_count': manipulation_detected,
                'manipulation_detection_rate': round((manipulation_detected / stats['total_records']) * 100, 1),
                'name_matching_success_count': name_matching_success,
                'name_matching_success_rate': round((name_matching_success / stats['total_records']) * 100, 1)
            })
        else:
            stats.update({
                'recent_submissions': 0,
                'manipulation_detected_count': 0,
                'manipulation_detection_rate': 0,
                'name_matching_success_count': 0,
                'name_matching_success_rate': 0
            })
        
        # Add AI system status
        stats['ai_features_stats'] = {
            'name_matching_enabled': True,
            'manipulation_detection_enabled': True,
            'fraud_analysis_enabled': True,
            'duplicate_detection_enabled': True,
            'risk_assessment_enabled': True
        }
        
        logger.info(f"✅ Statistics generated for user {user_id}")
        return jsonify({
            'success': True,
            'stats': stats,
            'generated_at': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error generating statistics: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Failed to generate statistics',
            'message': 'An error occurred while calculating your statistics'
        }), 500

# ================================
# 💾 CREATE RECORD (SAVE TO DATABASE)
# ================================

@records_bp.route('/api/records', methods=['POST', 'OPTIONS'])
@jwt_required()
def create_record():
    """💾 Create/Save a new record to database"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'message': 'Request body must contain record data'
            }), 400
        
        logger.info(f"💾 Creating record for user: {user_id}")
        
        # Validate required fields
        required_fields = ['document_type', 'extracted_fields', 'confidence_score', 'filename']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                'error': 'Missing required fields',
                'missing_fields': missing_fields,
                'required_fields': required_fields
            }), 400
        
        # Validate document type
        if data.get('document_type') not in ['aadhaar', 'pan']:
            return jsonify({
                'error': 'Invalid document type',
                'message': 'Document type must be aadhaar or pan'
            }), 400
        
        from ..utils.database import db
        from ..models.record import EnhancedRecord
        
        # Create enhanced record with all provided data
        record = EnhancedRecord(
            user_id=user_id,
            document_type=data['document_type'],
            extracted_fields=data['extracted_fields'],
            raw_text=data.get('raw_text', ''),
            confidence_score=float(data['confidence_score']),
            filename=data['filename'],
            original_filename=data.get('original_filename', data['filename']),
            
            # AI Analysis Results
            fraud_score=data.get('fraud_score', 0.0),
            risk_category=data.get('risk_category', 'low'),
            fraud_indicators=data.get('fraud_indicators', []),
            user_entered_name=data.get('user_entered_name', ''),
            name_matching_result=data.get('name_matching_result', {}),
            manipulation_result=data.get('manipulation_result', {}),
            duplicate_check=data.get('duplicate_check', []),
            document_hash=data.get('document_hash'),
            
            # Validation and Processing
            validation=data.get('validation', {'is_valid': True}),
            processing_details=data.get('processing_details', {}),
            file_info=data.get('file_info', {}),
            metrics=data.get('metrics', {})
        )
        
        # Additional fields from fraud analysis
        if 'fraud_analysis' in data:
            fraud_analysis = data['fraud_analysis']
            record.fraud_analysis = fraud_analysis
            record.fraud_score = fraud_analysis.get('fraud_score', 0.0)
            record.risk_category = fraud_analysis.get('risk_category', 'low')
            record.fraud_indicators = fraud_analysis.get('risk_factors', [])
        
        # Save record to database
        record_id = record.save(db)
        
        if not record_id:
            return jsonify({
                'error': 'Failed to save record',
                'message': 'Database save operation failed'
            }), 500
        
        # Log successful save
        logger.info(f"✅ Record created successfully: {record_id}")
        
        # Log audit event
        try:
            db.log_audit_event(user_id, 'record_saved', {
                'record_id': str(record_id),
                'document_type': data['document_type'],
                'fraud_score': record.fraud_score,
                'confidence_score': record.confidence_score
            })
        except Exception as audit_error:
            logger.warning(f"Audit logging failed: {str(audit_error)}")
        
        return jsonify({
            'success': True,
            'message': 'Record saved to database successfully',
            'record': {
                'id': str(record_id),
                'document_type': record.document_type,
                'confidence_score': record.confidence_score,
                'fraud_score': record.fraud_score,
                'risk_category': record.risk_category,
                'created_at': record.processed_at.isoformat() if record.processed_at else datetime.utcnow().isoformat()
            }
        }), 201
        
    except ValueError as ve:
        logger.warning(f"❌ Validation error: {str(ve)}")
        return jsonify({
            'error': 'Validation failed',
            'message': str(ve)
        }), 400
        
    except Exception as e:
        logger.error(f"❌ Error creating record: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Failed to create record',
            'message': 'An error occurred while saving the record'
        }), 500

# ================================
# 👁️ GET SINGLE RECORD
# ================================

@records_bp.route('/api/records/<record_id>', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_single_record(record_id):
    """👁️ Get detailed information for a single record"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        user_id = get_jwt_identity()
        logger.info(f"👁️ Fetching record {record_id} for user {user_id}")
        
        # Validate record ID format
        try:
            ObjectId(record_id)
        except:
            return jsonify({
                'error': 'Invalid record ID format',
                'message': 'Record ID must be a valid ObjectId'
            }), 400
        
        from ..utils.database import db
        from ..models.record import EnhancedRecord
        
        # Find record by ID and user
        record = EnhancedRecord.find_by_id(db, record_id, user_id)
        
        if not record:
            return jsonify({
                'error': 'Record not found',
                'message': 'The requested record does not exist or you do not have access to it'
            }), 404
        
        # Return detailed record information
        record_data = record.to_dict(include_id=True, include_sensitive=True)
        
        logger.info(f"✅ Record {record_id} retrieved successfully")
        return jsonify({
            'success': True,
            'record': record_data
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching record {record_id}: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Failed to fetch record',
            'message': 'An error occurred while retrieving the record'
        }), 500

# ================================
# ✏️ UPDATE RECORD
# ================================

@records_bp.route('/api/records/<record_id>', methods=['PUT', 'OPTIONS'])
@jwt_required()
def update_record(record_id):
    """✏️ Update record information (limited fields)"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'message': 'Request body must contain update data'
            }), 400
        
        logger.info(f"✏️ Updating record {record_id} for user {user_id}")
        
        from ..utils.database import db
        from ..models.record import EnhancedRecord
        
        # Find record
        record = EnhancedRecord.find_by_id(db, record_id, user_id)
        
        if not record:
            return jsonify({
                'error': 'Record not found',
                'message': 'The requested record does not exist or you do not have access to it'
            }), 404
        
        # Check if record can be updated (not admin reviewed)
        if record.admin_reviewed:
            return jsonify({
                'error': 'Record cannot be updated',
                'message': 'This record has been reviewed by an administrator and cannot be modified'
            }), 403
        
        # Allowed fields for update
        allowed_fields = ['user_entered_name', 'status', 'notes']
        updated_fields = []
        
        for field in allowed_fields:
            if field in data:
                if field == 'status' and data[field] not in ['processed', 'verified', 'rejected']:
                    return jsonify({
                        'error': 'Invalid status',
                        'message': 'Status must be one of: processed, verified, rejected'
                    }), 400
                
                setattr(record, field, data[field])
                updated_fields.append(field)
        
        if not updated_fields:
            return jsonify({
                'error': 'No valid fields to update',
                'allowed_fields': allowed_fields
            }), 400
        
        # Update timestamps
        record.updated_at = datetime.utcnow()
        
        # Save changes
        record.save(db)
        
        # Log audit event
        try:
            db.log_audit_event(user_id, 'record_updated', {
                'record_id': record_id,
                'updated_fields': updated_fields,
                'changes': {field: data[field] for field in updated_fields}
            })
        except Exception as audit_error:
            logger.warning(f"Audit logging failed: {str(audit_error)}")
        
        logger.info(f"✅ Record {record_id} updated successfully")
        return jsonify({
            'success': True,
            'message': 'Record updated successfully',
            'updated_fields': updated_fields,
            'record': record.to_dict(include_id=True)
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error updating record {record_id}: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Failed to update record',
            'message': 'An error occurred while updating the record'
        }), 500

# ================================
# 🗑️ DELETE RECORD
# ================================

@records_bp.route('/api/records/<record_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required()
def delete_record(record_id):
    """🗑️ Delete a record permanently"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        user_id = get_jwt_identity()
        logger.info(f"🗑️ Deleting record {record_id} for user {user_id}")
        
        from ..utils.database import db
        from ..models.record import EnhancedRecord
        
        # Use the static delete method
        result = EnhancedRecord.delete_record(db, record_id, user_id)
        
        if result:
            logger.info(f"✅ Record {record_id} deleted successfully")
            return jsonify({
                'success': True,
                'message': 'Record deleted successfully'
            }), 200
        else:
            return jsonify({
                'error': 'Delete failed',
                'message': 'The record could not be deleted'
            }), 500
            
    except ValueError as ve:
        logger.warning(f"❌ Delete validation error: {str(ve)}")
        return jsonify({
            'error': 'Delete failed',
            'message': str(ve)
        }), 404
        
    except Exception as e:
        logger.error(f"❌ Error deleting record {record_id}: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Failed to delete record',
            'message': 'An error occurred while deleting the record'
        }), 500

# ================================
# 📊 BULK OPERATIONS
# ================================

@records_bp.route('/api/records/bulk-delete', methods=['POST', 'OPTIONS'])
@jwt_required()
def bulk_delete_records():
    """🗑️ Delete multiple records at once"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or 'record_ids' not in data:
            return jsonify({
                'error': 'No record IDs provided',
                'message': 'Request body must contain record_ids array'
            }), 400
        
        record_ids = data['record_ids']
        
        if not isinstance(record_ids, list) or not record_ids:
            return jsonify({
                'error': 'Invalid record IDs',
                'message': 'record_ids must be a non-empty array'
            }), 400
        
        if len(record_ids) > 50:  # Limit bulk operations
            return jsonify({
                'error': 'Too many records',
                'message': 'Maximum 50 records can be deleted at once'
            }), 400
        
        logger.info(f"🗑️ Bulk deleting {len(record_ids)} records for user {user_id}")
        
        from ..utils.database import db
        from ..models.record import EnhancedRecord
        
        deleted_count = 0
        failed_deletes = []
        
        for record_id in record_ids:
            try:
                result = EnhancedRecord.delete_record(db, record_id, user_id)
                if result:
                    deleted_count += 1
                else:
                    failed_deletes.append(record_id)
            except Exception as delete_error:
                logger.warning(f"Failed to delete record {record_id}: {str(delete_error)}")
                failed_deletes.append(record_id)
        
        # Log audit event
        try:
            db.log_audit_event(user_id, 'bulk_delete_records', {
                'requested_count': len(record_ids),
                'deleted_count': deleted_count,
                'failed_count': len(failed_deletes),
                'deleted_record_ids': [rid for rid in record_ids if rid not in failed_deletes]
            })
        except Exception as audit_error:
            logger.warning(f"Audit logging failed: {str(audit_error)}")
        
        logger.info(f"✅ Bulk delete completed: {deleted_count}/{len(record_ids)} records deleted")
        
        return jsonify({
            'success': True,
            'message': f'Bulk delete completed: {deleted_count}/{len(record_ids)} records deleted',
            'deleted_count': deleted_count,
            'failed_count': len(failed_deletes),
            'failed_record_ids': failed_deletes
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error in bulk delete: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Bulk delete failed',
            'message': 'An error occurred during bulk delete operation'
        }), 500

# ================================
# 📤 EXPORT RECORDS
# ================================

@records_bp.route('/api/records/export/csv', methods=['GET', 'OPTIONS'])
@jwt_required()
def export_records_csv():
    """📤 Export user records to CSV format"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        user_id = get_jwt_identity()
        logger.info(f"📤 Exporting CSV for user: {user_id}")
        
        # Get filters from query parameters
        filters = {}
        doc_type = request.args.get('type')
        if doc_type in ['aadhaar', 'pan']:
            filters['document_type'] = doc_type
        
        risk_category = request.args.get('risk')
        if risk_category in ['low', 'medium', 'high']:
            filters['risk_category'] = risk_category
        
        from ..utils.database import db
        from ..models.record import EnhancedRecord
        
        # Get all matching records (no pagination for export)
        records, _ = EnhancedRecord.find_by_user(
            db=db,
            user_id=user_id,
            filters=filters,
            page=1,
            per_page=1000,  # Large number to get all records
            sort_by='processed_at',
            sort_order=-1
        )
        
        if not records:
            return jsonify({
                'error': 'No records found',
                'message': 'No records available for export with current filters'
            }), 404
        
        # Create CSV content
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Enhanced CSV headers
        headers = [
            'ID', 'Document Type', 'Filename', 'Processed At', 'Status',
            'Confidence Score', 'Fraud Score', 'Risk Category', 'Is Valid',
            'Admin Reviewed', 'Admin Decision', 'Name (Extracted)', 'Name (User Entered)',
            'Name Match Score', 'Name Match Result', 'Aadhaar Number', 'PAN Number',
            'Date of Birth', 'Gender', 'Address', 'Father Name',
            'Manipulation Detected', 'Manipulation Score', 'Risk Factors Count',
            'Duplicate Check Count', 'Processing Method', 'AI Features Used',
            'OCR Processing Time', 'Total Processing Time'
        ]
        
        writer.writerow(headers)
        
        # Write data rows
        for record in records:
            extracted = record.extracted_fields or {}
            fraud_analysis = record.fraud_analysis or {}
            name_matching = fraud_analysis.get('analysis_details', {}).get('name_matching_result', {})
            manipulation = record.manipulation_result or {}
            processing = record.processing_details or {}
            metrics = record.metrics or {}
            
            row = [
                str(record._id) if hasattr(record, '_id') else '',
                record.document_type or '',
                record.filename or '',
                record.processed_at.isoformat() if record.processed_at else '',
                record.status or '',
                record.confidence_score or 0,
                fraud_analysis.get('fraud_score', 0),
                fraud_analysis.get('risk_category', 'low'),
                record.validation.get('is_valid', False) if record.validation else False,
                record.admin_reviewed or False,
                record.admin_decision or '',
                extracted.get('name', ''),
                record.user_entered_name or '',
                name_matching.get('similarity_score', ''),
                name_matching.get('match_type', ''),
                extracted.get('aadhaar_number', ''),
                extracted.get('pan_number', ''),
                extracted.get('date_of_birth', ''),
                extracted.get('gender', ''),
                extracted.get('address', ''),
                extracted.get('father_name', ''),
                manipulation.get('manipulation_detected', False),
                manipulation.get('manipulation_score', 0),
                len(fraud_analysis.get('risk_factors', [])),
                len(record.duplicate_check or []),
                processing.get('extraction_method', ''),
                '; '.join(processing.get('ai_features_used', [])),
                metrics.get('ocr_processing_time', ''),
                metrics.get('total_processing_time', '')
            ]
            
            writer.writerow(row)
        
        csv_content = output.getvalue()
        output.close()
        
        # Create response
        response = make_response(csv_content)
        response.headers['Content-Type'] = 'text/csv'
        response.headers['Content-Disposition'] = f'attachment; filename=kyc-records-{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        
        logger.info(f"✅ CSV export completed: {len(records)} records exported")
        
        # Log audit event
        try:
            db.log_audit_event(user_id, 'records_exported', {
                'export_format': 'csv',
                'record_count': len(records),
                'filters_applied': filters
            })
        except Exception as audit_error:
            logger.warning(f"Audit logging failed: {str(audit_error)}")
        
        return response
        
    except Exception as e:
        logger.error(f"❌ Error exporting CSV: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Export failed',
            'message': 'An error occurred while exporting records'
        }), 500

# ================================
# 🔍 SEARCH RECORDS
# ================================

@records_bp.route('/api/records/search', methods=['GET', 'OPTIONS'])
@jwt_required()
def search_records():
    """🔍 Advanced search across user records"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        user_id = get_jwt_identity()
        query = request.args.get('q', '').strip()
        
        if not query or len(query) < 2:
            return jsonify({
                'error': 'Invalid search query',
                'message': 'Search query must be at least 2 characters long'
            }), 400
        
        logger.info(f"🔍 Searching records for user {user_id}: '{query}'")
        
        from ..utils.database import db
        
        records_collection = db.get_collection('records')
        
        # Build search query
        search_query = {
            'user_id': ObjectId(user_id) if isinstance(user_id, str) else user_id,
            '$or': [
                {'extracted_fields.name': {'$regex': query, '$options': 'i'}},
                {'filename': {'$regex': query, '$options': 'i'}},
                {'original_filename': {'$regex': query, '$options': 'i'}},
                {'user_entered_name': {'$regex': query, '$options': 'i'}},
                {'extracted_fields.aadhaar_number': {'$regex': query, '$options': 'i'}},
                {'extracted_fields.pan_number': {'$regex': query, '$options': 'i'}},
                {'extracted_fields.father_name': {'$regex': query, '$options': 'i'}},
                {'fraud_analysis.risk_factors': {'$regex': query, '$options': 'i'}}
            ]
        }
        
        # Execute search
        cursor = records_collection.find(search_query).sort('processed_at', -1).limit(50)
        
        search_results = []
        for record_data in cursor:
            # Create lightweight record for search results
            result = {
                'id': str(record_data['_id']),
                'document_type': record_data.get('document_type'),
                'filename': record_data.get('filename'),
                'original_filename': record_data.get('original_filename'),
                'extracted_name': record_data.get('extracted_fields', {}).get('name', ''),
                'user_entered_name': record_data.get('user_entered_name', ''),
                'confidence_score': record_data.get('confidence_score', 0),
                'fraud_score': record_data.get('fraud_analysis', {}).get('fraud_score', 0),
                'risk_category': record_data.get('fraud_analysis', {}).get('risk_category', 'low'),
                'processed_at': record_data.get('processed_at').isoformat() if record_data.get('processed_at') else '',
                'admin_reviewed': record_data.get('admin_reviewed', False)
            }
            
            search_results.append(result)
        
        logger.info(f"✅ Search completed: {len(search_results)} results found")
        
        return jsonify({
            'success': True,
            'query': query,
            'results': search_results,
            'total_results': len(search_results),
            'search_performed_at': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error searching records: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Search failed',
            'message': 'An error occurred while searching records'
        }), 500

# Export blueprint
__all__ = ['records_bp']
