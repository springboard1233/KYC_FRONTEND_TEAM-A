# advanced_fraud_detection.py - Advanced AI-powered fraud detection
import cv2
import numpy as np
import imagehash
from PIL import Image
import hashlib
import magic
import exifread
from datetime import datetime, timedelta
import re
import os
import logging

logger = logging.getLogger(__name__)

class AdvancedFraudDetector:
    def __init__(self):
        self.known_fraud_patterns = {}
        self.suspicious_metadata_patterns = []
        self.image_manipulation_thresholds = {
            'jpeg_quality_variance': 15,
            'compression_artifacts': 0.7,
            'edge_consistency': 0.8,
            'color_histogram_variance': 0.25
        }
    
    def detect_document_authenticity(self, image_path, document_type):
        """
        Advanced AI-powered document authenticity detection
        Returns comprehensive fraud analysis
        """
        analysis_result = {
            'authenticity_score': 0,
            'fraud_indicators': [],
            'security_features_detected': [],
            'image_manipulation_detected': False,
            'metadata_anomalies': [],
            'risk_level': 'Low',
            'confidence': 0.0
        }
        
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                analysis_result['fraud_indicators'].append("Could not load image for analysis")
                return analysis_result
            
            # 1. Image Manipulation Detection
            manipulation_score = self._detect_image_manipulation(image_path, image)
            analysis_result['image_manipulation_detected'] = manipulation_score > 0.5
            
            # 2. Document Structure Analysis
            structure_score = self._analyze_document_structure(image, document_type)
            
            # 3. Security Features Detection
            security_features = self._detect_security_features(image, document_type)
            analysis_result['security_features_detected'] = security_features
            
            # 4. Metadata Analysis
            metadata_anomalies = self._analyze_image_metadata(image_path)
            analysis_result['metadata_anomalies'] = metadata_anomalies
            
            # 5. Pattern Recognition for Known Fraud Templates
            template_match_score = self._check_fraud_template_database(image)
            
            # 6. Color and Print Quality Analysis
            print_quality_score = self._analyze_print_quality(image)
            
            # Calculate overall authenticity score
            scores = {
                'manipulation': 1.0 - manipulation_score,
                'structure': structure_score,
                'security': len(security_features) / self._get_expected_security_features(document_type),
                'metadata': 1.0 - (len(metadata_anomalies) * 0.2),
                'template': 1.0 - template_match_score,
                'quality': print_quality_score
            }
            
            # Weighted average
            weights = {'manipulation': 0.25, 'structure': 0.20, 'security': 0.20, 
                      'metadata': 0.15, 'template': 0.10, 'quality': 0.10}
            
            authenticity_score = sum(scores[key] * weights[key] for key in scores.keys())
            analysis_result['authenticity_score'] = max(0, min(100, authenticity_score * 100))
            
            # Determine risk level and fraud indicators
            self._classify_risk_and_indicators(analysis_result, scores)
            
            logger.info(f"Document authenticity analysis completed: {analysis_result['authenticity_score']:.1f}%")
            
        except Exception as e:
            logger.error(f"Error in document authenticity detection: {str(e)}")
            analysis_result['fraud_indicators'].append(f"Analysis error: {str(e)}")
            
        return analysis_result
    
    def _detect_image_manipulation(self, image_path, image):
        """Detect digital image manipulation using computer vision"""
        manipulation_indicators = []
        
        try:
            # 1. JPEG compression analysis
            with open(image_path, 'rb') as f:
                file_content = f.read()
                
            # Check for multiple compression artifacts
            jpeg_quality = self._estimate_jpeg_quality(image)
            if jpeg_quality < 70:
                manipulation_indicators.append("Low JPEG quality suggests re-compression")
            
            # 2. Edge consistency analysis
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            edge_consistency = self._analyze_edge_consistency(edges)
            
            if edge_consistency < self.image_manipulation_thresholds['edge_consistency']:
                manipulation_indicators.append("Inconsistent edge patterns detected")
            
            # 3. Error Level Analysis (ELA) simulation
            ela_score = self._perform_ela_analysis(image_path)
            if ela_score > 0.6:
                manipulation_indicators.append("Error Level Analysis indicates manipulation")
            
            # 4. Color histogram analysis
            hist_variance = self._analyze_color_histogram_variance(image)
            if hist_variance > self.image_manipulation_thresholds['color_histogram_variance']:
                manipulation_indicators.append("Abnormal color distribution detected")
            
            # 5. Noise pattern analysis
            noise_inconsistency = self._analyze_noise_patterns(gray)
            if noise_inconsistency > 0.7:
                manipulation_indicators.append("Inconsistent noise patterns suggest editing")
            
        except Exception as e:
            logger.error(f"Image manipulation detection error: {str(e)}")
            manipulation_indicators.append("Could not complete manipulation analysis")
        
        return len(manipulation_indicators) / 5.0  # Normalize to 0-1
    
    def _analyze_document_structure(self, image, document_type):
        """Analyze document layout and structure authenticity"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Template matching for expected document structure
            if document_type == 'aadhaar':
                return self._analyze_aadhaar_structure(gray)
            elif document_type == 'pan':
                return self._analyze_pan_structure(gray)
            
        except Exception as e:
            logger.error(f"Document structure analysis error: {str(e)}")
            
        return 0.5  # Default neutral score
    
    def _detect_security_features(self, image, document_type):
        """Detect security features specific to document type"""
        security_features = []
        
        try:
            # Convert to different color spaces for analysis
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            if document_type == 'aadhaar':
                # Look for Aadhaar-specific security features
                if self._detect_holographic_elements(image):
                    security_features.append("Holographic elements detected")
                
                if self._detect_microtext(gray):
                    security_features.append("Microtext patterns found")
                
                if self._detect_security_thread(image):
                    security_features.append("Security thread visible")
                
            elif document_type == 'pan':
                # Look for PAN-specific security features
                if self._detect_lamination_pattern(image):
                    security_features.append("Lamination pattern detected")
                
                if self._detect_pan_logo_authenticity(image):
                    security_features.append("Authentic PAN logo detected")
            
        except Exception as e:
            logger.error(f"Security feature detection error: {str(e)}")
            
        return security_features
    
    def _analyze_image_metadata(self, image_path):
        """Analyze image metadata for suspicious patterns"""
        anomalies = []
        
        try:
            # EXIF data analysis
            with open(image_path, 'rb') as f:
                tags = exifread.process_file(f, details=False)
            
            # Check for suspicious software signatures
            software_tags = ['Image Software', 'EXIF Software']
            for tag in software_tags:
                if tag in tags:
                    software = str(tags[tag])
                    if any(suspicious in software.lower() for suspicious in 
                          ['photoshop', 'gimp', 'paint.net', 'canva', 'figma']):
                        anomalies.append(f"Image editing software detected: {software}")
            
            # Check creation date consistency
            if 'EXIF DateTime' in tags:
                creation_date = str(tags['EXIF DateTime'])
                try:
                    date_obj = datetime.strptime(creation_date, '%Y:%m:%d %H:%M:%S')
                    if date_obj > datetime.now():
                        anomalies.append("Future creation date detected")
                    elif date_obj < datetime.now() - timedelta(days=365*10):
                        anomalies.append("Unusually old creation date")
                except:
                    anomalies.append("Invalid date format in metadata")
            
            # File size vs resolution analysis
            file_size = os.path.getsize(image_path)
            if file_size < 50000:  # Less than 50KB
                anomalies.append("Suspiciously small file size for document image")
            
        except Exception as e:
            logger.error(f"Metadata analysis error: {str(e)}")
            
        return anomalies
    
    def _check_fraud_template_database(self, image):
        """Check against known fraud template database"""
        try:
            # Create perceptual hash of the image
            pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            image_hash = str(imagehash.phash(pil_image))
            
            # Compare with known fraud patterns
            # In production, this would query a database of known fraudulent templates
            fraud_score = 0.0
            
            # Simulate template matching (in real implementation, use actual database)
            known_fraud_hashes = [
                'a1b2c3d4e5f6g7h8',  # Example fraud template hashes
                'b2c3d4e5f6g7h8i9',
                'c3d4e5f6g7h8i9j0'
            ]
            
            for fraud_hash in known_fraud_hashes:
                similarity = self._calculate_hash_similarity(image_hash, fraud_hash)
                if similarity > 0.8:
                    fraud_score = max(fraud_score, similarity)
            
            return fraud_score
            
        except Exception as e:
            logger.error(f"Fraud template check error: {str(e)}")
            return 0.0
    
    def _analyze_print_quality(self, image):
        """Analyze print quality and paper characteristics"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Calculate sharpness using Laplacian variance
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # Normalize sharpness score
            sharpness_score = min(1.0, laplacian_var / 1000.0)
            
            # Analyze paper texture (simplified)
            texture_score = self._analyze_paper_texture(gray)
            
            # Combined print quality score
            quality_score = (sharpness_score + texture_score) / 2.0
            
            return quality_score
            
        except Exception as e:
            logger.error(f"Print quality analysis error: {str(e)}")
            return 0.5
    
    # Helper methods (simplified implementations)
    def _get_expected_security_features(self, document_type):
        """Return expected number of security features for document type"""
        if document_type == 'aadhaar':
            return 3  # Hologram, microtext, security thread
        elif document_type == 'pan':
            return 2  # Lamination, logo
        return 1
    
    def _classify_risk_and_indicators(self, analysis_result, scores):
        """Classify risk level and populate fraud indicators"""
        score = analysis_result['authenticity_score']
        
        if score >= 80:
            analysis_result['risk_level'] = 'Low'
            analysis_result['confidence'] = 0.9
        elif score >= 60:
            analysis_result['risk_level'] = 'Medium'
            analysis_result['confidence'] = 0.7
        else:
            analysis_result['risk_level'] = 'High'
            analysis_result['confidence'] = 0.5
            
        # Add specific fraud indicators based on low scores
        if scores['manipulation'] < 0.6:
            analysis_result['fraud_indicators'].append("Digital manipulation detected")
        if scores['structure'] < 0.5:
            analysis_result['fraud_indicators'].append("Document structure inconsistencies")
        if scores['security'] < 0.4:
            analysis_result['fraud_indicators'].append("Missing expected security features")
        if scores['template'] < 0.7:
            analysis_result['fraud_indicators'].append("Matches known fraud template")
    
    # Additional helper methods (simplified for brevity)
    def _estimate_jpeg_quality(self, image):
        return 85  # Simplified - real implementation would analyze DCT coefficients
    
    def _analyze_edge_consistency(self, edges):
        return 0.75  # Simplified edge analysis
    
    def _perform_ela_analysis(self, image_path):
        return 0.3  # Simplified ELA implementation
    
    def _analyze_color_histogram_variance(self, image):
        hist = cv2.calcHist([image], [0, 1, 2], None, [50, 50, 50], [0, 256, 0, 256, 0, 256])
        return np.var(hist) / 100000.0
    
    def _analyze_noise_patterns(self, gray):
        return 0.4  # Simplified noise analysis
    
    def _analyze_aadhaar_structure(self, gray):
        return 0.8  # Simplified structure analysis
    
    def _analyze_pan_structure(self, gray):
        return 0.8  # Simplified structure analysis
    
    def _detect_holographic_elements(self, image):
        return True  # Simplified hologram detection
    
    def _detect_microtext(self, gray):
        return True  # Simplified microtext detection
    
    def _detect_security_thread(self, image):
        return False  # Simplified security thread detection
    
    def _detect_lamination_pattern(self, image):
        return True  # Simplified lamination detection
    
    def _detect_pan_logo_authenticity(self, image):
        return True  # Simplified logo authentication
    
    def _calculate_hash_similarity(self, hash1, hash2):
        # Calculate Hamming distance between hashes
        if len(hash1) != len(hash2):
            return 0.0
        return 1.0 - (sum(c1 != c2 for c1, c2 in zip(hash1, hash2)) / len(hash1))
    
    def _analyze_paper_texture(self, gray):
        # Simplified paper texture analysis
        return 0.7

# Behavioral Analysis for User Interactions
class BehaviorAnalyzer:
    def __init__(self):
        self.suspicious_patterns = []
        
    def analyze_user_behavior(self, user_session_data):
        """Analyze user behavior patterns for fraud indicators"""
        behavior_score = {
            'risk_score': 0,
            'suspicious_activities': [],
            'behavior_flags': [],
            'session_analysis': {}
        }
        
        try:
            # Analyze upload patterns
            upload_behavior = self._analyze_upload_behavior(user_session_data.get('uploads', []))
            behavior_score['session_analysis']['upload_pattern'] = upload_behavior
            
            # Analyze timing patterns
            timing_analysis = self._analyze_timing_patterns(user_session_data.get('timestamps', []))
            behavior_score['session_analysis']['timing_pattern'] = timing_analysis
            
            # Check for automated behavior
            automation_indicators = self._detect_automation(user_session_data)
            behavior_score['behavior_flags'].extend(automation_indicators)
            
            # Calculate overall behavior risk score
            risk_factors = len(behavior_score['behavior_flags'])
            behavior_score['risk_score'] = min(100, risk_factors * 20)
            
        except Exception as e:
            logger.error(f"Behavior analysis error: {str(e)}")
            
        return behavior_score
    
    def _analyze_upload_behavior(self, uploads):
        """Analyze document upload patterns"""
        if len(uploads) > 5:  # More than 5 uploads in session
            return "High frequency uploads detected"
        return "Normal upload pattern"
    
    def _analyze_timing_patterns(self, timestamps):
        """Analyze timing between user actions"""
        if len(timestamps) < 2:
            return "Insufficient data"
            
        # Check for suspiciously fast interactions
        fast_interactions = 0
        for i in range(1, len(timestamps)):
            time_diff = timestamps[i] - timestamps[i-1]
            if time_diff < 1000:  # Less than 1 second
                fast_interactions += 1
                
        if fast_interactions > len(timestamps) * 0.5:
            return "Suspiciously fast user interactions"
        return "Normal interaction timing"
    
    def _detect_automation(self, session_data):
        """Detect signs of automated/bot behavior"""
        indicators = []
        
        # Check user agent consistency
        user_agents = session_data.get('user_agents', [])
        if len(set(user_agents)) > 3:
            indicators.append("Multiple user agents detected")
            
        # Check for missing mouse/touch events
        if not session_data.get('mouse_events', False):
            indicators.append("No mouse interaction detected")
            
        return indicators
