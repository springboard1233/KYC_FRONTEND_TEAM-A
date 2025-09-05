from datetime import datetime
from bson.objectid import ObjectId
import logging

logger = logging.getLogger(__name__)

class Record:
    """Record model for storing OCR extraction results"""
    
    def __init__(self, user_id, document_type, extracted_fields, raw_text, 
                 confidence_score, filename, original_filename=None):
        self.user_id = ObjectId(user_id) if isinstance(user_id, str) else user_id
        self.document_type = document_type.lower()
        self.extracted_fields = extracted_fields or {}
        self.raw_text = raw_text or ""
        self.confidence_score = float(confidence_score) if confidence_score else 0.0
        self.filename = filename
        self.original_filename = original_filename or filename
        self.uploaded_at = datetime.utcnow()
        self.processed_at = datetime.utcnow()
        self.status = 'processed'  # processed, verified, rejected
        self.notes = ""
        self.validation_errors = []
    
    def to_dict(self, include_id=True):
        """Convert record to dictionary"""
        data = {
            'user_id': str(self.user_id),
            'document_type': self.document_type,
            'extracted_fields': self.extracted_fields,
            'raw_text': self.raw_text,
            'confidence_score': self.confidence_score,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'uploaded_at': self.uploaded_at.isoformat(),
            'processed_at': self.processed_at.isoformat(),
            'status': self.status,
            'notes': self.notes,
            'validation_errors': self.validation_errors
        }
        
        if include_id and hasattr(self, '_id'):
            data['id'] = str(self._id)
        
        return data
    
    def save(self, db):
        """Save record to database"""
        try:
            records_collection = db.get_collection('records')
            
            record_data = {
                'user_id': self.user_id,
                'document_type': self.document_type,
                'extracted_fields': self.extracted_fields,
                'raw_text': self.raw_text,
                'confidence_score': self.confidence_score,
                'filename': self.filename,
                'original_filename': self.original_filename,
                'uploaded_at': self.uploaded_at,
                'processed_at': self.processed_at,
                'status': self.status,
                'notes': self.notes,
                'validation_errors': self.validation_errors
            }
            
            if hasattr(self, '_id'):
                # Update existing record
                records_collection.update_one({'_id': self._id}, {'$set': record_data})
                return self._id
            else:
                # Create new record
                result = records_collection.insert_one(record_data)
                self._id = result.inserted_id
                return result.inserted_id
                
        except Exception as e:
            logger.error(f"Failed to save record: {str(e)}")
            raise
    
    @staticmethod
    def find_by_id(db, record_id, user_id=None):
        """Find record by ID"""
        try:
            records_collection = db.get_collection('records')
            
            query = {'_id': ObjectId(record_id)}
            if user_id:
                query['user_id'] = ObjectId(user_id)
            
            record_data = records_collection.find_one(query)
            
            if record_data:
                record = Record.__new__(Record)
                record._id = record_data['_id']
                record.user_id = record_data['user_id']
                record.document_type = record_data['document_type']
                record.extracted_fields = record_data['extracted_fields']
                record.raw_text = record_data['raw_text']
                record.confidence_score = record_data['confidence_score']
                record.filename = record_data['filename']
                record.original_filename = record_data.get('original_filename', record_data['filename'])
                record.uploaded_at = record_data['uploaded_at']
                record.processed_at = record_data['processed_at']
                record.status = record_data.get('status', 'processed')
                record.notes = record_data.get('notes', '')
                record.validation_errors = record_data.get('validation_errors', [])
                
                return record
                
        except Exception as e:
            logger.error(f"Failed to find record: {str(e)}")
        
        return None
    
    @staticmethod
    def find_by_user(db, user_id, filters=None, page=1, per_page=10):
        """Find records for a specific user with pagination"""
        try:
            records_collection = db.get_collection('records')
            
            # Build query
            query = {'user_id': ObjectId(user_id)}
            
            # Apply filters
            if filters:
                if filters.get('document_type'):
                    query['document_type'] = filters['document_type']
                
                if filters.get('status'):
                    query['status'] = filters['status']
                
                if filters.get('min_confidence'):
                    query['confidence_score'] = {'$gte': float(filters['min_confidence'])}
            
            # Count total records
            total_count = records_collection.count_documents(query)
            
            # Calculate pagination
            skip = (page - 1) * per_page
            
            # Find records with pagination
            cursor = records_collection.find(query).sort('processed_at', -1).skip(skip).limit(per_page)
            
            records = []
            for record_data in cursor:
                record = Record.__new__(Record)
                record._id = record_data['_id']
                record.user_id = record_data['user_id']
                record.document_type = record_data['document_type']
                record.extracted_fields = record_data['extracted_fields']
                record.raw_text = record_data['raw_text']
                record.confidence_score = record_data['confidence_score']
                record.filename = record_data['filename']
                record.original_filename = record_data.get('original_filename', record_data['filename'])
                record.uploaded_at = record_data['uploaded_at']
                record.processed_at = record_data['processed_at']
                record.status = record_data.get('status', 'processed')
                record.notes = record_data.get('notes', '')
                record.validation_errors = record_data.get('validation_errors', [])
                
                records.append(record)
            
            return records, total_count
            
        except Exception as e:
            logger.error(f"Failed to find user records: {str(e)}")
            raise
    
    def update_status(self, db, new_status, notes=None):
        """Update record status"""
        try:
            self.status = new_status
            if notes:
                self.notes = notes
            
            records_collection = db.get_collection('records')
            records_collection.update_one(
                {'_id': self._id},
                {'$set': {'status': self.status, 'notes': self.notes}}
            )
            
            logger.info(f"Updated record {self._id} status to {new_status}")
            
        except Exception as e:
            logger.error(f"Failed to update record status: {str(e)}")
            raise

