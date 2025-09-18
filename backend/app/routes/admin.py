# routes/admin.py - Enhanced Admin Panel Routes for AI-Powered KYC System

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
import traceback
from datetime import datetime, timedelta
from bson.objectid import ObjectId
from typing import Dict, List, Any, Optional

# Configure logging
logger = logging.getLogger(__name__)

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """🛡️ Decorator to ensure only admin users can access certain routes"""
    def decorated_function(*args, **kwargs):
        try:
            user_id = get_jwt_identity()
            
            from ..utils.database import db
            from ..models.user import EnhancedUser
            
            user = EnhancedUser.find_by_id(db, user_id)
            
            if not user or user.role != 'admin':
                return jsonify({
                    'error': 'Admin access required',
                    'message': 'This endpoint requires administrator privileges'
                }), 403
            
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Admin authorization error: {str(e)}")
            return jsonify({
                'error': 'Authorization failed',
                'message': 'Unable to verify admin status'
            }), 500
    
    decorated_function.__name__ = f.__name__
    return decorated_function

# ================================
# 📋 ADMIN REVIEW QUEUE MANAGEMENT
# ================================

@admin_bp.route('/api/admin/queue', methods=['GET', 'OPTIONS'])
@jwt_required()
@admin_required
def get_review_queue():
    """📋 Get documents requiring admin review with advanced filtering"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        # Parse query parameters
        priority = request.args.get('priority', 'all')  # all, critical, high, medium
        page = max(1, int(request.args.get('page', 1)))
        per_page = min(100, max(1, int(request.args.get('per_page', 20))))
        search = request.args.get('search', '').strip()
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        logger.info(f"🔍 Admin fetching review queue: priority={priority}, page={page}")
        
        from ..utils.database import db
        from ..models.record import EnhancedRecord
        
        # Get admin queue with filters
        queue_records = EnhancedRecord.get_admin_queue(db, priority_filter=priority, limit=per_page * 5)
        
        # Apply additional filters
        filtered_records = []
        
        for record in queue_records:
            # Search filter
            if search:
                searchable_text = ' '.join([
                    record.extracted_fields.get('name', ''),
                    record.filename,
                    record.user_entered_name or '',
                    str(record.fraud_analysis.get('fraud_score', 0))
                ]).lower()
                
                if search.lower() not in searchable_text:
                    continue
            
            # Date filters
            if date_from:
                try:
                    from_date = datetime.fromisoformat(date_from)
                    if record.processed_at < from_date:
                        continue
                except ValueError:
                    pass
            
            if date_to:
                try:
                    to_date = datetime.fromisoformat(date_to)
                    if record.processed_at > to_date:
                        continue
                except ValueError:
                    pass
            
            filtered_records.append(record)
        
        # Pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_records = filtered_records[start_idx:end_idx]
        
        # Convert to response format
        queue_data = []
        for record in paginated_records:
            try:
                # Get user information
                user = None
                try:
                    from ..models.user import EnhancedUser
                    user = EnhancedUser.find_by_id(db, record.user_id)
                except Exception as user_error:
                    logger.warning(f"Failed to fetch user for record {record._id}: {str(user_error)}")
                
                # Calculate time pending
                time_pending = None
                if record.processed_at:
                    pending_duration = datetime.utcnow() - record.processed_at
                    days = pending_duration.days
                    hours, remainder = divmod(pending_duration.seconds, 3600)
                    minutes, _ = divmod(remainder, 60)
                    
                    if days > 0:
                        time_pending = f"{days}d {hours}h"
                    elif hours > 0:
                        time_pending = f"{hours}h {minutes}m"
                    else:
                        time_pending = f"{minutes}m"
                
                # Determine priority based on fraud score and other factors
                fraud_score = record.fraud_analysis.get('fraud_score', 0)
                if fraud_score >= 85:
                    priority_level = 'critical'
                elif fraud_score >= 70:
                    priority_level = 'high'
                else:
                    priority_level = 'medium'
                
                record_data = {
                    'id': str(record._id),
                    'document_type': record.document_type,
                    'filename': record.filename,
                    'processed_at': record.processed_at.isoformat() if record.processed_at else None,
                    'time_pending': time_pending,
                    'fraud_score': fraud_score,
                    'risk_category': record.fraud_analysis.get('risk_category', 'medium'),
                    'priority': priority_level,
                    'extracted_fields': record.extracted_fields,
                    'user_entered_name': record.user_entered_name,
                    'risk_factors': record.fraud_analysis.get('risk_factors', []),
                    'name_matching_result': record.name_matching_result,
                    'manipulation_result': record.manipulation_result,
                    'duplicate_check': record.duplicate_check,
                    'confidence_score': record.confidence_score,
                    'requires_manual_review': record.fraud_analysis.get('requires_manual_review', False),
                    'submitter': {
                        'id': str(user._id) if user else None,
                        'name': user.name if user else 'Unknown',
                        'email': user.email if user else 'Unknown'
                    } if user else None
                }
                
                queue_data.append(record_data)
                
            except Exception as record_error:
                logger.error(f"Error processing record {record._id}: {str(record_error)}")
                continue
        
        # Calculate statistics
        total_queue = len(filtered_records)
        critical_count = len([r for r in filtered_records if r.fraud_analysis.get('fraud_score', 0) >= 85])
        high_count = len([r for r in filtered_records if 70 <= r.fraud_analysis.get('fraud_score', 0) < 85])
        medium_count = len([r for r in filtered_records if r.fraud_analysis.get('fraud_score', 0) < 70])
        
        response_data = {
            'success': True,
            'queue': queue_data,
            'pagination': {
                'current_page': page,
                'per_page': per_page,
                'total_count': total_queue,
                'total_pages': (total_queue + per_page - 1) // per_page,
                'has_next': end_idx < total_queue,
                'has_prev': page > 1
            },
            'statistics': {
                'total_pending': total_queue,
                'critical_priority': critical_count,
                'high_priority': high_count,
                'medium_priority': medium_count,
                'avg_fraud_score': round(sum(r.fraud_analysis.get('fraud_score', 0) for r in filtered_records) / max(len(filtered_records), 1), 1)
            },
            'filters_applied': {
                'priority': priority,
                'search': search,
                'date_from': date_from,
                'date_to': date_to
            }
        }
        
        logger.info(f"✅ Admin queue retrieved: {len(queue_data)} records, {total_queue} total pending")
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching admin queue: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Failed to fetch review queue',
            'message': 'An error occurred while retrieving pending reviews'
        }), 500

@admin_bp.route('/api/admin/review/<record_id>', methods=['POST', 'OPTIONS'])
@jwt_required()
@admin_required
def review_document(record_id):
    """⚖️ Admin review decision for a document"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        admin_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Request data required',
                'message': 'Please provide review decision and notes'
            }), 400
        
        decision = data.get('decision', '').lower()
        notes = data.get('notes', '').strip()
        
        # Validate decision
        valid_decisions = ['approve', 'reject', 'flag']
        if decision not in valid_decisions:
            return jsonify({
                'error': 'Invalid decision',
                'message': f'Decision must be one of: {", ".join(valid_decisions)}',
                'valid_decisions': valid_decisions
            }), 400
        
        logger.info(f"⚖️ Admin {admin_id} reviewing record {record_id}: {decision}")
        
        from ..utils.database import db
        from ..models.record import EnhancedRecord
        from ..models.user import EnhancedUser
        
        # Get admin user info
        admin_user = EnhancedUser.find_by_id(db, admin_id)
        if not admin_user:
            return jsonify({
                'error': 'Admin user not found',
                'message': 'Unable to verify admin identity'
            }), 404
        
        # Find the record
        record = EnhancedRecord.find_by_id(db, record_id)
        if not record:
            return jsonify({
                'error': 'Record not found',
                'message': 'The document record could not be found'
            }), 404
        
        # Check if already reviewed
        if record.admin_reviewed:
            return jsonify({
                'error': 'Already reviewed',
                'message': f'This document was already reviewed by {record.admin_reviewer_name}',
                'previous_decision': record.admin_decision,
                'reviewed_at': record.admin_reviewed_at.isoformat() if record.admin_reviewed_at else None
            }), 409
        
        # Mark as reviewed
        record.mark_admin_review(
            db=db,
            admin_id=admin_id,
            admin_name=admin_user.name,
            decision=decision,
            notes=notes
        )
        
        # Log audit event
        try:
            db.log_audit_event(admin_id, 'admin_document_review', {
                'record_id': record_id,
                'decision': decision,
                'document_type': record.document_type,
                'fraud_score': record.fraud_analysis.get('fraud_score', 0),
                'user_id': str(record.user_id),
                'notes_length': len(notes)
            })
        except Exception as audit_error:
            logger.warning(f"Audit logging failed: {str(audit_error)}")
        
        logger.info(f"✅ Record {record_id} reviewed successfully: {decision}")
        
        return jsonify({
            'success': True,
            'message': f'Document {decision}d successfully',
            'review_details': {
                'record_id': record_id,
                'decision': decision,
                'reviewer': admin_user.name,
                'reviewed_at': datetime.utcnow().isoformat(),
                'notes': notes
            }
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error reviewing document {record_id}: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Review failed',
            'message': 'An error occurred while processing the review'
        }), 500

# ================================
# 👥 USER MANAGEMENT
# ================================

@admin_bp.route('/api/admin/users', methods=['GET', 'OPTIONS'])
@jwt_required()
@admin_required
def get_users():
    """👥 Get all users with filtering and pagination"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        # Parse query parameters
        page = max(1, int(request.args.get('page', 1)))
        per_page = min(100, max(1, int(request.args.get('per_page', 20))))
        search = request.args.get('search', '').strip()
        role_filter = request.args.get('role', 'all')
        status_filter = request.args.get('status', 'all')  # all, active, inactive
        sort_by = request.args.get('sort_by', 'created_at')
        sort_order = request.args.get('sort_order', 'desc')
        
        logger.info(f"👥 Admin fetching users: page={page}, role={role_filter}")
        
        from ..utils.database import db
        from ..models.user import EnhancedUser
        
        # Build filters
        filters = {}
        if role_filter != 'all' and role_filter in ['user', 'admin', 'moderator']:
            filters['role'] = role_filter
        
        if status_filter == 'active':
            filters['is_active'] = True
        elif status_filter == 'inactive':
            filters['is_active'] = False
        
        # Get users with pagination
        users, total_count = EnhancedUser.get_all_users(
            db=db,
            page=page,
            per_page=per_page,
            filters=filters
        )
        
        # Apply search filter
        if search:
            filtered_users = []
            for user in users:
                searchable_text = ' '.join([
                    user.name or '',
                    user.email or '',
                    user.role or ''
                ]).lower()
                
                if search.lower() in searchable_text:
                    filtered_users.append(user)
            
            users = filtered_users
        
        # Convert to response format
        users_data = []
        for user in users:
            try:
                # Get user statistics
                user_stats = db.get_user_stats(str(user._id))
                
                user_data = {
                    'id': str(user._id),
                    'name': user.name,
                    'email': user.email,
                    'role': user.role,
                    'is_active': user.is_active,
                    'is_verified': user.is_verified,
                    'email_verified': getattr(user, 'email_verified', False),
                    'phone_verified': getattr(user, 'phone_verified', False),
                    'account_locked': getattr(user, 'account_locked', False),
                    'created_at': user.created_at.isoformat() if user.created_at else None,
                    'last_login': user.last_login.isoformat() if user.last_login else None,
                    'login_count': getattr(user, 'login_count', 0),
                    'failed_login_attempts': getattr(user, 'failed_login_attempts', 0),
                    'statistics': {
                        'total_documents': user_stats.get('total_records', 0),
                        'verified_documents': user_stats.get('verified_count', 0),
                        'high_risk_documents': user_stats.get('high_risk_count', 0),
                        'avg_fraud_score': user_stats.get('avg_fraud_score', 0)
                    }
                }
                
                users_data.append(user_data)
                
            except Exception as user_error:
                logger.warning(f"Error processing user {user._id}: {str(user_error)}")
                continue
        
        # Calculate pagination
        total_pages = (total_count + per_page - 1) // per_page
        
        response_data = {
            'success': True,
            'users': users_data,
            'pagination': {
                'current_page': page,
                'per_page': per_page,
                'total_count': len(users_data),
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            },
            'filters_applied': {
                'search': search,
                'role': role_filter,
                'status': status_filter,
                'sort_by': sort_by,
                'sort_order': sort_order
            }
        }
        
        logger.info(f"✅ Users retrieved: {len(users_data)} users")
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching users: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Failed to fetch users',
            'message': 'An error occurred while retrieving user data'
        }), 500

@admin_bp.route('/api/admin/users/<user_id>/status', methods=['PATCH', 'OPTIONS'])
@jwt_required()
@admin_required
def update_user_status(user_id):
    """🔐 Update user account status (activate/deactivate/unlock)"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        admin_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Request data required',
                'message': 'Please provide status update information'
            }), 400
        
        action = data.get('action', '').lower()
        reason = data.get('reason', '').strip()
        
        valid_actions = ['activate', 'deactivate', 'unlock', 'lock']
        if action not in valid_actions:
            return jsonify({
                'error': 'Invalid action',
                'message': f'Action must be one of: {", ".join(valid_actions)}',
                'valid_actions': valid_actions
            }), 400
        
        logger.info(f"🔐 Admin {admin_id} updating user {user_id} status: {action}")
        
        from ..utils.database import db
        from ..models.user import EnhancedUser
        
        # Find the user
        user = EnhancedUser.find_by_id(db, user_id)
        if not user:
            return jsonify({
                'error': 'User not found',
                'message': 'The specified user could not be found'
            }), 404
        
        # Prevent admin from deactivating themselves
        if str(user._id) == admin_id and action in ['deactivate', 'lock']:
            return jsonify({
                'error': 'Cannot modify own account',
                'message': 'Administrators cannot deactivate or lock their own accounts'
            }), 403
        
        # Apply the action
        original_status = {
            'is_active': user.is_active,
            'account_locked': getattr(user, 'account_locked', False)
        }
        
        if action == 'activate':
            user.is_active = True
        elif action == 'deactivate':
            user.is_active = False
        elif action == 'unlock':
            user.unlock_account()
        elif action == 'lock':
            user.account_locked = True
            user.failed_login_attempts = 5  # Set to max attempts
        
        # Save changes
        user.updated_at = datetime.utcnow()
        user.save(db)
        
        # Log audit event
        try:
            db.log_audit_event(admin_id, 'user_status_updated', {
                'target_user_id': user_id,
                'target_user_email': user.email,
                'action': action,
                'reason': reason,
                'original_status': original_status,
                'new_status': {
                    'is_active': user.is_active,
                    'account_locked': getattr(user, 'account_locked', False)
                }
            })
        except Exception as audit_error:
            logger.warning(f"Audit logging failed: {str(audit_error)}")
        
        logger.info(f"✅ User {user_id} status updated: {action}")
        
        return jsonify({
            'success': True,
            'message': f'User account {action}d successfully',
            'user': {
                'id': str(user._id),
                'email': user.email,
                'is_active': user.is_active,
                'account_locked': getattr(user, 'account_locked', False),
                'updated_at': user.updated_at.isoformat() if user.updated_at else None
            }
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Error updating user status {user_id}: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Status update failed',
            'message': 'An error occurred while updating user status'
        }), 500

# ================================
# 📊 SYSTEM ANALYTICS AND REPORTING
# ================================

@admin_bp.route('/api/admin/analytics', methods=['GET', 'OPTIONS'])
@jwt_required()
@admin_required
def get_system_analytics():
    """📊 Get comprehensive system analytics for admin dashboard"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        # Parse date range parameters
        days_back = int(request.args.get('days', 30))
        include_charts = request.args.get('charts', 'true').lower() == 'true'
        
        logger.info(f"📊 Generating system analytics for last {days_back} days")
        
        from ..utils.database import db
        
        # Get database collections
        records_collection = db.get_collection('records')
        users_collection = db.get_collection('users')
        audit_collection = db.get_collection('audit_logs')
        
        # Date range calculation
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days_back)
        
        # ===== BASIC STATISTICS =====
        
        # Total users
        total_users = users_collection.count_documents({})
        active_users = users_collection.count_documents({'is_active': True})
        new_users_period = users_collection.count_documents({
            'created_at': {'$gte': start_date}
        })
        
        # Total documents
        total_documents = records_collection.count_documents({})
        documents_period = records_collection.count_documents({
            'processed_at': {'$gte': start_date}
        })
        
        # Fraud statistics
        high_risk_docs = records_collection.count_documents({
            'fraud_analysis.risk_category': 'high'
        })
        
        fraud_pipeline = [
            {'$match': {'fraud_analysis.fraud_score': {'$exists': True}}},
            {'$group': {
                '_id': None,
                'avg_fraud_score': {'$avg': '$fraud_analysis.fraud_score'},
                'max_fraud_score': {'$max': '$fraud_analysis.fraud_score'},
                'total_analyzed': {'$sum': 1}
            }}
        ]
        
        fraud_stats = list(records_collection.aggregate(fraud_pipeline))
        avg_fraud_score = fraud_stats[0]['avg_fraud_score'] if fraud_stats else 0
        
        # Admin activity
        admin_reviews = records_collection.count_documents({
            'admin_reviewed': True,
            'admin_reviewed_at': {'$gte': start_date}
        })
        
        pending_reviews = records_collection.count_documents({
            'admin_reviewed': False,
            'fraud_analysis.requires_manual_review': True
        })
        
        # ===== DOCUMENT TYPE DISTRIBUTION =====
        
        doc_type_pipeline = [
            {'$group': {
                '_id': '$document_type',
                'count': {'$sum': 1}
            }},
            {'$sort': {'count': -1}}
        ]
        
        doc_types_raw = list(records_collection.aggregate(doc_type_pipeline))
        document_types = {doc['_id']: doc['count'] for doc in doc_types_raw}
        
        # ===== RISK DISTRIBUTION =====
        
        risk_pipeline = [
            {'$group': {
                '_id': '$fraud_analysis.risk_category',
                'count': {'$sum': 1}
            }}
        ]
        
        risk_raw = list(records_collection.aggregate(risk_pipeline))
        risk_distribution = {risk['_id'] or 'unknown': risk['count'] for risk in risk_raw}
        
        # ===== PROCESSING PERFORMANCE =====
        
        performance_pipeline = [
            {'$match': {
                'processing_details.total_processing_time': {'$exists': True},
                'processed_at': {'$gte': start_date}
            }},
            {'$group': {
                '_id': None,
                'avg_processing_time': {'$avg': '$processing_details.total_processing_time'},
                'max_processing_time': {'$max': '$processing_details.total_processing_time'},
                'min_processing_time': {'$min': '$processing_details.total_processing_time'},
                'total_processed': {'$sum': 1}
            }}
        ]
        
        perf_stats = list(records_collection.aggregate(performance_pipeline))
        performance_metrics = perf_stats[0] if perf_stats else {
            'avg_processing_time': 0,
            'max_processing_time': 0,
            'min_processing_time': 0,
            'total_processed': 0
        }
        
        # ===== CHART DATA (if requested) =====
        
        chart_data = {}
        if include_charts:
            # Daily submission trends
            daily_pipeline = [
                {'$match': {'processed_at': {'$gte': start_date}}},
                {'$group': {
                    '_id': {
                        'year': {'$year': '$processed_at'},
                        'month': {'$month': '$processed_at'},
                        'day': {'$dayOfMonth': '$processed_at'}
                    },
                    'count': {'$sum': 1},
                    'avg_fraud_score': {'$avg': '$fraud_analysis.fraud_score'}
                }},
                {'$sort': {'_id': 1}},
                {'$limit': 30}  # Last 30 days
            ]
            
            daily_data = list(records_collection.aggregate(daily_pipeline))
            
            chart_data['daily_submissions'] = [
                {
                    'date': f"{item['_id']['year']}-{item['_id']['month']:02d}-{item['_id']['day']:02d}",
                    'submissions': item['count'],
                    'avg_fraud_score': round(item.get('avg_fraud_score', 0), 1)
                }
                for item in daily_data
            ]
            
            # Fraud score distribution
            fraud_dist_pipeline = [
                {'$match': {'fraud_analysis.fraud_score': {'$exists': True}}},
                {'$bucket': {
                    'groupBy': '$fraud_analysis.fraud_score',
                    'boundaries': [0, 20, 40, 60, 80, 100],
                    'default': 'other',
                    'output': {'count': {'$sum': 1}}
                }}
            ]
            
            fraud_dist = list(records_collection.aggregate(fraud_dist_pipeline))
            chart_data['fraud_score_distribution'] = [
                {
                    'range': f"{item['_id']}-{item['_id']+19}" if isinstance(item['_id'], int) else str(item['_id']),
                    'count': item['count']
                }
                for item in fraud_dist
            ]
        
        # ===== COMPILE ANALYTICS RESPONSE =====
        
        analytics_data = {
            'success': True,
            'generated_at': datetime.utcnow().isoformat(),
            'period': {
                'days_back': days_back,
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'summary': {
                'total_users': total_users,
                'active_users': active_users,
                'new_users_period': new_users_period,
                'total_documents': total_documents,
                'documents_period': documents_period,
                'high_risk_documents': high_risk_docs,
                'avg_fraud_score': round(avg_fraud_score, 1),
                'admin_reviews_period': admin_reviews,
                'pending_reviews': pending_reviews
            },
            'distributions': {
                'document_types': document_types,
                'risk_categories': risk_distribution
            },
            'performance': {
                'avg_processing_time': round(performance_metrics.get('avg_processing_time', 0), 2),
                'max_processing_time': round(performance_metrics.get('max_processing_time', 0), 2),
                'min_processing_time': round(performance_metrics.get('min_processing_time', 0), 2),
                'total_processed_period': performance_metrics.get('total_processed', 0)
            },
            'charts': chart_data if include_charts else None
        }
        
        logger.info(f"✅ System analytics generated successfully")
        return jsonify(analytics_data), 200
        
    except Exception as e:
        logger.error(f"❌ Error generating system analytics: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Analytics generation failed',
            'message': 'An error occurred while generating system analytics'
        }), 500

# ================================
# 🔍 AUDIT TRAIL AND LOGGING
# ================================

@admin_bp.route('/api/admin/audit', methods=['GET', 'OPTIONS'])
@jwt_required()
@admin_required
def get_audit_trail():
    """🔍 Get system audit trail with filtering"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        # Parse query parameters
        page = max(1, int(request.args.get('page', 1)))
        per_page = min(100, max(1, int(request.args.get('per_page', 50))))
        action_filter = request.args.get('action')
        user_filter = request.args.get('user_id')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        logger.info(f"🔍 Admin fetching audit trail: page={page}")
        
        from ..utils.database import db
        
        audit_collection = db.get_collection('audit_logs')
        
        # Build query
        query = {}
        
        if action_filter:
            query['action'] = {'$regex': action_filter, '$options': 'i'}
        
        if user_filter:
            try:
                query['user_id'] = ObjectId(user_filter)
            except:
                pass
        
        if date_from:
            try:
                from_date = datetime.fromisoformat(date_from)
                query['timestamp'] = {'$gte': from_date}
            except ValueError:
                pass
        
        if date_to:
            try:
                to_date = datetime.fromisoformat(date_to)
                if 'timestamp' in query:
                    query['timestamp']['$lte'] = to_date
                else:
                    query['timestamp'] = {'$lte': to_date}
            except ValueError:
                pass
        
        # Get total count
        total_count = audit_collection.count_documents(query)
        
        # Get paginated results
        skip = (page - 1) * per_page
        cursor = audit_collection.find(query).sort('timestamp', -1).skip(skip).limit(per_page)
        
        # Process audit records
        audit_records = []
        for record in cursor:
            try:
                # Get user information
                user_info = None
                if record.get('user_id'):
                    try:
                        from ..models.user import EnhancedUser
                        user = EnhancedUser.find_by_id(db, record['user_id'])
                        if user:
                            user_info = {
                                'id': str(user._id),
                                'name': user.name,
                                'email': user.email,
                                'role': user.role
                            }
                    except Exception as user_error:
                        logger.warning(f"Failed to fetch user info for audit record: {str(user_error)}")
                
                audit_data = {
                    'id': str(record['_id']),
                    'timestamp': record['timestamp'].isoformat() if record.get('timestamp') else None,
                    'action': record.get('action', 'unknown'),
                    'user_id': str(record['user_id']) if record.get('user_id') else None,
                    'user_info': user_info,
                    'details': record.get('details', {}),
                    'ip_address': record.get('details', {}).get('ip_address'),
                    'user_agent': record.get('details', {}).get('user_agent', '')[:100] if record.get('details', {}).get('user_agent') else None
                }
                
                audit_records.append(audit_data)
                
            except Exception as record_error:
                logger.warning(f"Error processing audit record: {str(record_error)}")
                continue
        
        # Calculate pagination
        total_pages = (total_count + per_page - 1) // per_page
        
        response_data = {
            'success': True,
            'audit_trail': audit_records,
            'pagination': {
                'current_page': page,
                'per_page': per_page,
                'total_count': total_count,
                'total_pages': total_pages,
                'has_next': page < total_pages,
                'has_prev': page > 1
            },
            'filters_applied': {
                'action': action_filter,
                'user_id': user_filter,
                'date_from': date_from,
                'date_to': date_to
            }
        }
        
        logger.info(f"✅ Audit trail retrieved: {len(audit_records)} records")
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"❌ Error fetching audit trail: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Failed to fetch audit trail',
            'message': 'An error occurred while retrieving audit records'
        }), 500

# ================================
# 🏥 SYSTEM HEALTH MONITORING
# ================================

@admin_bp.route('/api/admin/health', methods=['GET', 'OPTIONS'])
@jwt_required()
@admin_required
def get_system_health():
    """🏥 Get comprehensive system health status"""
    
    if request.method == 'OPTIONS':
        return jsonify({'message': 'OK'}), 200
    
    try:
        logger.info("🏥 Generating system health report")
        
        from ..utils.database import db
        
        health_status = {
            'overall_status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'components': {},
            'metrics': {},
            'alerts': []
        }
        
        # ===== DATABASE HEALTH =====
        try:
            # Test database connection
            db.client.admin.command('ping')
            
            # Get database stats
            stats = db.client[db.dbname].command('dbStats')
            
            health_status['components']['database'] = {
                'status': 'healthy',
                'response_time_ms': 0,  # Would measure actual response time
                'collections': stats.get('collections', 0),
                'data_size_mb': round(stats.get('dataSize', 0) / (1024 * 1024), 2),
                'storage_size_mb': round(stats.get('storageSize', 0) / (1024 * 1024), 2)
            }
            
        except Exception as db_error:
            logger.error(f"Database health check failed: {str(db_error)}")
            health_status['components']['database'] = {
                'status': 'unhealthy',
                'error': str(db_error)
            }
            health_status['overall_status'] = 'degraded'
            health_status['alerts'].append('Database connection issues detected')
        
        # ===== PROCESSING QUEUE HEALTH =====
        try:
            records_collection = db.get_collection('records')
            
            # Check pending review queue
            pending_count = records_collection.count_documents({
                'admin_reviewed': False,
                'fraud_analysis.requires_manual_review': True
            })
            
            # Check recent processing activity
            recent_cutoff = datetime.utcnow() - timedelta(hours=1)
            recent_processed = records_collection.count_documents({
                'processed_at': {'$gte': recent_cutoff}
            })
            
            queue_status = 'healthy'
            if pending_count > 100:
                queue_status = 'degraded'
                health_status['alerts'].append(f'High number of pending reviews: {pending_count}')
            
            health_status['components']['processing_queue'] = {
                'status': queue_status,
                'pending_reviews': pending_count,
                'recent_processed_1h': recent_processed
            }
            
        except Exception as queue_error:
            logger.error(f"Queue health check failed: {str(queue_error)}")
            health_status['components']['processing_queue'] = {
                'status': 'unhealthy',
                'error': str(queue_error)
            }
            health_status['overall_status'] = 'degraded'
        
        # ===== USER ACTIVITY HEALTH =====
        try:
            users_collection = db.get_collection('users')
            
            # Active users
            active_users = users_collection.count_documents({'is_active': True})
            total_users = users_collection.count_documents({})
            
            # Recent user activity
            recent_logins = users_collection.count_documents({
                'last_login': {'$gte': datetime.utcnow() - timedelta(days=7)}
            })
            
            activity_rate = (recent_logins / max(total_users, 1)) * 100
            
            health_status['components']['user_activity'] = {
                'status': 'healthy',
                'total_users': total_users,
                'active_users': active_users,
                'recent_logins_7d': recent_logins,
                'activity_rate_percent': round(activity_rate, 1)
            }
            
        except Exception as activity_error:
            logger.error(f"User activity health check failed: {str(activity_error)}")
            health_status['components']['user_activity'] = {
                'status': 'unhealthy',
                'error': str(activity_error)
            }
        
        # ===== FRAUD DETECTION HEALTH =====
        try:
            # Check fraud detection performance
            fraud_pipeline = [
                {
                    '$match': {
                        'processed_at': {'$gte': datetime.utcnow() - timedelta(days=1)},
                        'fraud_analysis.fraud_score': {'$exists': True}
                    }
                },
                {
                    '$group': {
                        '_id': None,
                        'avg_fraud_score': {'$avg': '$fraud_analysis.fraud_score'},
                        'total_analyzed': {'$sum': 1},
                        'high_risk_count': {
                            '$sum': {
                                '$cond': [
                                    {'$gte': ['$fraud_analysis.fraud_score', 70]},
                                    1, 0
                                ]
                            }
                        }
                    }
                }
            ]
            
            fraud_stats = list(records_collection.aggregate(fraud_pipeline))
            
            if fraud_stats:
                stats = fraud_stats[0]
                high_risk_rate = (stats['high_risk_count'] / max(stats['total_analyzed'], 1)) * 100
                
                fraud_status = 'healthy'
                if high_risk_rate > 50:  # More than 50% high risk
                    fraud_status = 'degraded'
                    health_status['alerts'].append(f'High fraud detection rate: {high_risk_rate:.1f}%')
                
                health_status['components']['fraud_detection'] = {
                    'status': fraud_status,
                    'analyzed_24h': stats['total_analyzed'],
                    'avg_fraud_score': round(stats['avg_fraud_score'], 1),
                    'high_risk_rate_percent': round(high_risk_rate, 1)
                }
            else:
                health_status['components']['fraud_detection'] = {
                    'status': 'healthy',
                    'analyzed_24h': 0,
                    'note': 'No recent fraud analysis data'
                }
                
        except Exception as fraud_error:
            logger.error(f"Fraud detection health check failed: {str(fraud_error)}")
            health_status['components']['fraud_detection'] = {
                'status': 'unhealthy',
                'error': str(fraud_error)
            }
        
        # ===== OVERALL HEALTH ASSESSMENT =====
        unhealthy_components = [
            name for name, component in health_status['components'].items()
            if component.get('status') == 'unhealthy'
        ]
        
        degraded_components = [
            name for name, component in health_status['components'].items()
            if component.get('status') == 'degraded'
        ]
        
        if unhealthy_components:
            health_status['overall_status'] = 'unhealthy'
        elif degraded_components:
            health_status['overall_status'] = 'degraded'
        
        # Add summary metrics
        health_status['metrics'] = {
            'total_components': len(health_status['components']),
            'healthy_components': len([c for c in health_status['components'].values() if c.get('status') == 'healthy']),
            'degraded_components': len(degraded_components),
            'unhealthy_components': len(unhealthy_components),
            'total_alerts': len(health_status['alerts'])
        }
        
        logger.info(f"✅ System health report generated: {health_status['overall_status']}")
        return jsonify(health_status), 200
        
    except Exception as e:
        logger.error(f"❌ Error generating system health report: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({
            'overall_status': 'unhealthy',
            'error': 'Health check failed',
            'message': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

# Export blueprint
__all__ = ['admin_bp']
