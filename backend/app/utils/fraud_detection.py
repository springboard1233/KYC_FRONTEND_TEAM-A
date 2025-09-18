# utils/fraud_detection.py - Advanced AI-Powered Fraud Detection Engine for KYC System

import os
import logging
import traceback
import hashlib
import numpy as np
import cv2
import random
import re
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Any, Optional
from collections import defaultdict
import statistics

# Configure logging
logger = logging.getLogger(__name__)

class AdvancedFraudDetector:
    """
    🛡️ Advanced AI-Powered Fraud Detection System
    
    Features:
    - Document manipulation detection using computer vision
    - Multi-layered authenticity verification
    - Risk scoring with confidence intervals
    - Pattern recognition for known fraud techniques
    - Real-time threat assessment
    """
    
    def __init__(self):
        """Initialize fraud detection system with optimized parameters"""
        
        # Detection thresholds and weights
        self.detection_config = {
            'manipulation_threshold': 40,  # Score above which manipulation is flagged
            'high_risk_threshold': 70,     # Score for high risk classification
            'confidence_threshold': 60,    # Minimum confidence for reliable detection
            
            # Weight distribution for different detection methods
            'weights': {
                'compression_artifacts': 0.25,
                'edge_consistency': 0.20,
                'font_analysis': 0.15,
                'lighting_consistency': 0.15,
                'color_analysis': 0.10,
                'noise_patterns': 0.10,
                'metadata_analysis': 0.05
            }
        }
        
        # Known fraud patterns database
        self.fraud_patterns = {
            'suspicious_numbers': [
                r'9999\d{8}',  # Aadhaar starting with 9999
                r'0000\d{8}',  # Sequential patterns
                r'1111\d{8}',
                r'(\d)\1{11}'  # All same digits
            ],
            'suspicious_names': [
                r'test\s+user',
                r'sample\s+name',
                r'demo\s+user',
                r'[a-z]{1,2}\s+[a-z]{1,2}',  # Very short names
                r'^\d+$'  # Names that are only numbers
            ],
            'document_anomalies': [
                'unusual_dimensions',
                'poor_quality',
                'inconsistent_fonts',
                'missing_security_features'
            ]
        }
        
        logger.info("✅ Advanced Fraud Detection System initialized")
    
    def detect_document_authenticity(self, image_path: str, document_type: str) -> Dict[str, Any]:
        """
        🔍 Comprehensive document authenticity verification
        
        Performs multi-layered analysis to detect manipulation and fraud
        """
        detection_start = datetime.utcnow()
        
        try:
            logger.info(f"🔍 Starting authenticity detection for {document_type}: {image_path}")
            
            # Load and validate image
            image = cv2.imread(image_path)
            if image is None:
                raise FileNotFoundError(f"Cannot load image: {image_path}")
            
            # Initialize detection result
            result = {
                'manipulation_detected': False,
                'manipulation_score': 0.0,
                'risk_level': 'low',
                'confidence': 0.0,
                'detected_issues': [],
                'technical_details': {},
                'detection_methods': {},
                'processing_time': 0.0
            }
            
            # Convert to different color spaces for analysis
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            
            # Store image metadata
            height, width = gray.shape
            result['technical_details']['image_dimensions'] = f"{width}x{height}"
            result['technical_details']['file_size'] = os.path.getsize(image_path)
            
            # Run detection algorithms
            detection_scores = {}
            confidence_scores = []
            
            # 1. Compression Artifact Analysis
            try:
                comp_score, comp_conf, comp_issues = self._analyze_compression_artifacts(gray)
                detection_scores['compression'] = comp_score
                confidence_scores.append(comp_conf)
                if comp_issues:
                    result['detected_issues'].extend(comp_issues)
                result['detection_methods']['compression_analysis'] = {
                    'score': comp_score,
                    'confidence': comp_conf,
                    'issues': comp_issues
                }
            except Exception as e:
                logger.warning(f"Compression analysis failed: {str(e)}")
            
            # 2. Edge Consistency Detection
            try:
                edge_score, edge_conf, edge_issues = self._analyze_edge_consistency(gray)
                detection_scores['edges'] = edge_score
                confidence_scores.append(edge_conf)
                if edge_issues:
                    result['detected_issues'].extend(edge_issues)
                result['detection_methods']['edge_analysis'] = {
                    'score': edge_score,
                    'confidence': edge_conf,
                    'issues': edge_issues
                }
            except Exception as e:
                logger.warning(f"Edge analysis failed: {str(e)}")
            
            # 3. Font and Text Consistency
            try:
                font_score, font_conf, font_issues = self._analyze_font_consistency(gray)
                detection_scores['fonts'] = font_score
                confidence_scores.append(font_conf)
                if font_issues:
                    result['detected_issues'].extend(font_issues)
                result['detection_methods']['font_analysis'] = {
                    'score': font_score,
                    'confidence': font_conf,
                    'issues': font_issues
                }
            except Exception as e:
                logger.warning(f"Font analysis failed: {str(e)}")
            
            # 4. Lighting and Shadow Consistency
            try:
                light_score, light_conf, light_issues = self._analyze_lighting_consistency(gray)
                detection_scores['lighting'] = light_score
                confidence_scores.append(light_conf)
                if light_issues:
                    result['detected_issues'].extend(light_issues)
                result['detection_methods']['lighting_analysis'] = {
                    'score': light_score,
                    'confidence': light_conf,
                    'issues': light_issues
                }
            except Exception as e:
                logger.warning(f"Lighting analysis failed: {str(e)}")
            
            # 5. Color Distribution Analysis
            try:
                color_score, color_conf, color_issues = self._analyze_color_consistency(hsv)
                detection_scores['color'] = color_score
                confidence_scores.append(color_conf)
                if color_issues:
                    result['detected_issues'].extend(color_issues)
                result['detection_methods']['color_analysis'] = {
                    'score': color_score,
                    'confidence': color_conf,
                    'issues': color_issues
                }
            except Exception as e:
                logger.warning(f"Color analysis failed: {str(e)}")
            
            # 6. Noise Pattern Analysis
            try:
                noise_score, noise_conf, noise_issues = self._analyze_noise_patterns(gray)
                detection_scores['noise'] = noise_score
                confidence_scores.append(noise_conf)
                if noise_issues:
                    result['detected_issues'].extend(noise_issues)
                result['detection_methods']['noise_analysis'] = {
                    'score': noise_score,
                    'confidence': noise_conf,
                    'issues': noise_issues
                }
            except Exception as e:
                logger.warning(f"Noise analysis failed: {str(e)}")
            
            # 7. Document Structure Analysis
            try:
                struct_score, struct_conf, struct_issues = self._analyze_document_structure(image, document_type)
                detection_scores['structure'] = struct_score
                confidence_scores.append(struct_conf)
                if struct_issues:
                    result['detected_issues'].extend(struct_issues)
                result['detection_methods']['structure_analysis'] = {
                    'score': struct_score,
                    'confidence': struct_conf,
                    'issues': struct_issues
                }
            except Exception as e:
                logger.warning(f"Structure analysis failed: {str(e)}")
            
            # Calculate weighted final score
            weighted_score = 0.0
            total_weight = 0.0
            
            for method, score in detection_scores.items():
                weight = self.detection_config['weights'].get(method, 0.1)
                weighted_score += score * weight
                total_weight += weight
            
            # Normalize score
            final_score = (weighted_score / total_weight) if total_weight > 0 else 0.0
            result['manipulation_score'] = round(min(100.0, max(0.0, final_score)), 1)
            
            # Calculate overall confidence
            avg_confidence = statistics.mean(confidence_scores) if confidence_scores else 0.0
            result['confidence'] = round(avg_confidence, 1)
            
            # Determine risk level and manipulation detection
            if result['manipulation_score'] >= self.detection_config['high_risk_threshold']:
                result['risk_level'] = 'high'
                result['manipulation_detected'] = True
            elif result['manipulation_score'] >= self.detection_config['manipulation_threshold']:
                result['risk_level'] = 'medium'
                result['manipulation_detected'] = True
            else:
                result['risk_level'] = 'low'
                result['manipulation_detected'] = False
            
            # Add AI-powered insights
            result['ai_insights'] = self._generate_ai_insights(result)
            
            # Calculate processing time
            processing_time = (datetime.utcnow() - detection_start).total_seconds()
            result['processing_time'] = round(processing_time, 2)
            
            logger.info(f"✅ Authenticity detection completed: {result['manipulation_score']}% risk, {result['risk_level']} level")
            return result
            
        except Exception as e:
            logger.error(f"❌ Document authenticity detection failed: {str(e)}")
            logger.error(traceback.format_exc())
            return {
                'manipulation_detected': False,
                'manipulation_score': 0.0,
                'risk_level': 'unknown',
                'confidence': 0.0,
                'detected_issues': [f'Analysis failed: {str(e)}'],
                'technical_details': {},
                'processing_time': (datetime.utcnow() - detection_start).total_seconds()
            }
    
    def _analyze_compression_artifacts(self, gray_image: np.ndarray) -> Tuple[float, float, List[str]]:
        """🔍 Analyze JPEG compression artifacts for manipulation detection"""
        try:
            issues = []
            score = 0.0
            
            # JPEG block analysis (8x8 blocks)
            height, width = gray_image.shape
            block_variances = []
            
            for y in range(0, height - 8, 8):
                for x in range(0, width - 8, 8):
                    block = gray_image[y:y+8, x:x+8]
                    block_variances.append(np.var(block))
            
            if block_variances:
                variance_of_variances = np.var(block_variances)
                
                # Unusual compression patterns
                if variance_of_variances < 50:
                    score += 25
                    issues.append("Unusual JPEG compression patterns detected")
                
                # Double compression detection
                mean_variance = np.mean(block_variances)
                if mean_variance < 10:
                    score += 20
                    issues.append("Possible double compression artifacts")
            
            # DCT coefficient analysis
            dct_blocks = []
            for y in range(0, height - 8, 8):
                for x in range(0, width - 8, 8):
                    block = gray_image[y:y+8, x:x+8].astype(np.float32)
                    dct_block = cv2.dct(block)
                    dct_blocks.append(dct_block)
            
            # Analyze DCT coefficients for anomalies
            if len(dct_blocks) > 10:
                high_freq_coeffs = []
                for block in dct_blocks[:100]:  # Sample first 100 blocks
                    # High frequency coefficients (bottom-right of DCT block)
                    high_freq = np.mean(np.abs(block[4:, 4:]))
                    high_freq_coeffs.append(high_freq)
                
                if high_freq_coeffs:
                    coeff_variance = np.var(high_freq_coeffs)
                    if coeff_variance > 100:
                        score += 15
                        issues.append("Inconsistent frequency domain characteristics")
            
            confidence = min(95, 60 + len(issues) * 10)
            return min(100.0, score), confidence, issues
            
        except Exception as e:
            logger.warning(f"Compression analysis error: {str(e)}")
            return 0.0, 0.0, []
    
    def _analyze_edge_consistency(self, gray_image: np.ndarray) -> Tuple[float, float, List[str]]:
        """📐 Analyze edge consistency across the document"""
        try:
            issues = []
            score = 0.0
            
            # Edge detection using multiple methods
            edges_canny = cv2.Canny(gray_image, 50, 150)
            edges_sobel_x = cv2.Sobel(gray_image, cv2.CV_64F, 1, 0, ksize=3)
            edges_sobel_y = cv2.Sobel(gray_image, cv2.CV_64F, 0, 1, ksize=3)
            edges_sobel = np.sqrt(edges_sobel_x**2 + edges_sobel_y**2)
            
            # Divide image into regions for consistency analysis
            height, width = gray_image.shape
            regions = [
                edges_canny[0:height//2, 0:width//2],           # Top-left
                edges_canny[0:height//2, width//2:width],       # Top-right
                edges_canny[height//2:height, 0:width//2],      # Bottom-left
                edges_canny[height//2:height, width//2:width]   # Bottom-right
            ]
            
            # Calculate edge density for each region
            edge_densities = [np.sum(region > 0) / region.size for region in regions]
            
            if len(edge_densities) >= 4:
                density_variance = np.var(edge_densities)
                density_mean = np.mean(edge_densities)
                
                # High variance indicates inconsistent edge patterns
                if density_variance > 0.01:
                    score += 20
                    issues.append("Inconsistent edge patterns across document regions")
                
                # Very low or very high edge density
                if density_mean < 0.05:
                    score += 15
                    issues.append("Unusually low edge density - possible over-smoothing")
                elif density_mean > 0.3:
                    score += 10
                    issues.append("Unusually high edge density - possible noise or artifacts")
            
            # Edge gradient analysis
            gradient_magnitude = np.sqrt(edges_sobel_x**2 + edges_sobel_y**2)
            gradient_direction = np.arctan2(edges_sobel_y, edges_sobel_x)
            
            # Analyze gradient consistency
            strong_edges = gradient_magnitude > np.percentile(gradient_magnitude, 90)
            if np.any(strong_edges):
                strong_directions = gradient_direction[strong_edges]
                direction_hist, _ = np.histogram(strong_directions, bins=8, range=(-np.pi, np.pi))
                
                # Check for unusual directional bias
                if np.max(direction_hist) > len(strong_directions) * 0.6:
                    score += 12
                    issues.append("Unusual edge direction bias detected")
            
            # Edge sharpness analysis
            edge_pixels = edges_canny > 0
            if np.any(edge_pixels):
                edge_sharpness = np.mean(gradient_magnitude[edge_pixels])
                median_sharpness = np.median(gradient_magnitude[edge_pixels])
                
                # Inconsistent edge sharpness
                if abs(edge_sharpness - median_sharpness) > edge_sharpness * 0.5:
                    score += 10
                    issues.append("Inconsistent edge sharpness across document")
            
            confidence = min(95, 65 + len(issues) * 8)
            return min(100.0, score), confidence, issues
            
        except Exception as e:
            logger.warning(f"Edge analysis error: {str(e)}")
            return 0.0, 0.0, []
    
    def _analyze_font_consistency(self, gray_image: np.ndarray) -> Tuple[float, float, List[str]]:
        """🔤 Analyze font and text rendering consistency"""
        try:
            issues = []
            score = 0.0
            
            # Find text regions using morphological operations
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
            dilated = cv2.dilate(gray_image, kernel, iterations=2)
            
            # Find contours (potential text regions)
            contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            text_regions = []
            region_stats = []
            
            for contour in contours:
                x, y, w, h = cv2.boundingRect(contour)
                
                # Filter for reasonable text region sizes
                if 20 < w < gray_image.shape[1] * 0.8 and 10 < h < gray_image.shape[0] * 0.3:
                    region = gray_image[y:y+h, x:x+w]
                    if region.size > 100:  # Minimum region size
                        text_regions.append(region)
                        
                        # Calculate statistics for this region
                        mean_intensity = np.mean(region)
                        std_intensity = np.std(region)
                        contrast = np.max(region) - np.min(region)
                        
                        region_stats.append({
                            'mean': mean_intensity,
                            'std': std_intensity,
                            'contrast': contrast,
                            'width': w,
                            'height': h
                        })
            
            if len(region_stats) >= 2:
                # Analyze consistency between text regions
                means = [stat['mean'] for stat in region_stats]
                stds = [stat['std'] for stat in region_stats]
                contrasts = [stat['contrast'] for stat in region_stats]
                
                # Check for unusual variations in text rendering
                mean_variance = np.var(means)
                if mean_variance > 900:  # Arbitrary threshold
                    score += 15
                    issues.append("Inconsistent text intensity across regions")
                
                std_variance = np.var(stds)
                if std_variance > 400:
                    score += 12
                    issues.append("Inconsistent text sharpness detected")
                
                contrast_variance = np.var(contrasts)
                if contrast_variance > 2500:
                    score += 10
                    issues.append("Inconsistent text contrast patterns")
                
                # Font size consistency
                heights = [stat['height'] for stat in region_stats]
                height_variance = np.var(heights)
                mean_height = np.mean(heights)
                
                if height_variance > (mean_height * 0.3) ** 2:
                    score += 8
                    issues.append("Inconsistent text/font sizes detected")
            
            # Character spacing analysis (basic)
            if len(text_regions) >= 1:
                for region in text_regions[:3]:  # Analyze top 3 regions
                    # Horizontal projection to find character spacing
                    horizontal_proj = np.sum(region, axis=0)
                    
                    # Find valleys (spaces between characters)
                    valleys = []
                    threshold = np.mean(horizontal_proj) * 0.7
                    
                    for i in range(1, len(horizontal_proj)-1):
                        if (horizontal_proj[i] < threshold and 
                            horizontal_proj[i] < horizontal_proj[i-1] and 
                            horizontal_proj[i] < horizontal_proj[i+1]):
                            valleys.append(i)
                    
                    if len(valleys) >= 3:
                        spacings = [valleys[i+1] - valleys[i] for i in range(len(valleys)-1)]
                        spacing_variance = np.var(spacings)
                        mean_spacing = np.mean(spacings)
                        
                        if spacing_variance > (mean_spacing * 0.4) ** 2:
                            score += 5
                            issues.append("Irregular character spacing detected")
            
            confidence = min(90, 55 + len(issues) * 7)
            return min(100.0, score), confidence, issues
            
        except Exception as e:
            logger.warning(f"Font analysis error: {str(e)}")
            return 0.0, 0.0, []
    
    def _analyze_lighting_consistency(self, gray_image: np.ndarray) -> Tuple[float, float, List[str]]:
        """💡 Analyze lighting and shadow consistency"""
        try:
            issues = []
            score = 0.0
            
            # Brightness distribution analysis
            brightness_hist, _ = np.histogram(gray_image.flatten(), bins=256, range=[0, 256])
            
            # Check for unusual brightness patterns
            bright_pixels = np.sum(brightness_hist[200:])
            dark_pixels = np.sum(brightness_hist[:50])
            total_pixels = gray_image.size
            
            bright_ratio = bright_pixels / total_pixels
            dark_ratio = dark_pixels / total_pixels
            
            if bright_ratio > 0.4:
                score += 12
                issues.append("Unusual brightness distribution - overexposed regions")
            
            if dark_ratio > 0.4:
                score += 10
                issues.append("Unusual brightness distribution - underexposed regions")
            
            # Local illumination consistency
            height, width = gray_image.shape
            
            # Divide image into grid for local brightness analysis
            grid_size = 4
            h_step = height // grid_size
            w_step = width // grid_size
            
            local_means = []
            for i in range(grid_size):
                for j in range(grid_size):
                    y1, y2 = i * h_step, min((i + 1) * h_step, height)
                    x1, x2 = j * w_step, min((j + 1) * w_step, width)
                    
                    region = gray_image[y1:y2, x1:x2]
                    if region.size > 0:
                        local_means.append(np.mean(region))
            
            if len(local_means) >= 4:
                illumination_variance = np.var(local_means)
                
                # High variance suggests inconsistent lighting
                if illumination_variance > 1600:  # Arbitrary threshold
                    score += 15
                    issues.append("Inconsistent lighting across document regions")
            
            # Shadow detection using gradient analysis
            kernel_size = max(5, min(gray_image.shape) // 50)
            if kernel_size % 2 == 0:
                kernel_size += 1
            
            # Calculate local standard deviation (texture measure)
            local_std = cv2.Laplacian(gray_image, cv2.CV_64F)
            std_variance = np.var(local_std)
            
            if std_variance > 15000:  # High variance in local contrast
                score += 12
                issues.append("Inconsistent lighting/shadow patterns detected")
            
            # Highlight/shadow ratio analysis
            median_brightness = np.median(gray_image)
            highlights = gray_image > (median_brightness + 50)
            shadows = gray_image < (median_brightness - 50)
            
            highlight_ratio = np.sum(highlights) / total_pixels
            shadow_ratio = np.sum(shadows) / total_pixels
            
            if highlight_ratio > 0.3 or shadow_ratio > 0.3:
                score += 8
                issues.append("Extreme highlight/shadow ratio detected")
            
            confidence = min(88, 60 + len(issues) * 6)
            return min(100.0, score), confidence, issues
            
        except Exception as e:
            logger.warning(f"Lighting analysis error: {str(e)}")
            return 0.0, 0.0, []
    
    def _analyze_color_consistency(self, hsv_image: np.ndarray) -> Tuple[float, float, List[str]]:
        """🌈 Analyze color distribution and consistency"""
        try:
            issues = []
            score = 0.0
            
            # Separate HSV channels
            h_channel = hsv_image[:, :, 0]
            s_channel = hsv_image[:, :, 1]
            v_channel = hsv_image[:, :, 2]
            
            # Hue analysis
            h_hist, _ = np.histogram(h_channel.flatten(), bins=180, range=[0, 180])
            
            # Calculate hue entropy
            h_probs = h_hist / np.sum(h_hist)
            h_probs = h_probs[h_probs > 0]  # Remove zeros for log calculation
            h_entropy = -np.sum(h_probs * np.log2(h_probs))
            
            # Low entropy might indicate artificial coloring
            if h_entropy < 3.5:
                score += 12
                issues.append("Unusual color distribution - possible artificial coloring")
            
            # Saturation analysis
            s_hist, _ = np.histogram(s_channel.flatten(), bins=256, range=[0, 256])
            
            # Check for over-saturation or under-saturation
            high_sat_pixels = np.sum(s_hist[200:])
            low_sat_pixels = np.sum(s_hist[:50])
            total_pixels = hsv_image[:, :, 0].size
            
            high_sat_ratio = high_sat_pixels / total_pixels
            low_sat_ratio = low_sat_pixels / total_pixels
            
            if high_sat_ratio > 0.3:
                score += 10
                issues.append("Over-saturated regions detected")
            
            if low_sat_ratio > 0.7:
                score += 8
                issues.append("Under-saturated document - possible bleaching")
            
            # Color channel correlation analysis
            height, width = hsv_image.shape[:2]
            
            # Sample regions for correlation analysis
            sample_size = min(1000, height * width // 4)
            indices = np.random.choice(height * width, sample_size, replace=False)
            
            h_sample = h_channel.flatten()[indices]
            s_sample = s_channel.flatten()[indices]
            v_sample = v_channel.flatten()[indices]
            
            # Calculate correlations
            hs_corr = np.corrcoef(h_sample, s_sample)[0, 1]
            hv_corr = np.corrcoef(h_sample, v_sample)[0, 1]
            sv_corr = np.corrcoef(s_sample, v_sample)[0, 1]
            
            # Unusual correlations might indicate manipulation
            if abs(hs_corr) > 0.8 or abs(hv_corr) > 0.8:
                score += 8
                issues.append("Unusual color channel correlations detected")
            
            # Color uniformity in document regions
            # Analyze color consistency in what should be uniform regions
            edges = cv2.Canny(cv2.cvtColor(hsv_image, cv2.COLOR_HSV2GRAY), 50, 150)
            uniform_regions = cv2.dilate(255 - edges, np.ones((10, 10), np.uint8), iterations=1)
            
            # Find large uniform regions
            contours, _ = cv2.findContours(uniform_regions, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for contour in contours[:5]:  # Check top 5 largest regions
                if cv2.contourArea(contour) > 1000:  # Minimum area
                    mask = np.zeros(uniform_regions.shape, np.uint8)
                    cv2.fillPoly(mask, [contour], 255)
                    
                    # Calculate color variance in this region
                    region_h = h_channel[mask > 0]
                    region_s = s_channel[mask > 0]
                    
                    if len(region_h) > 10:
                        h_var = np.var(region_h)
                        s_var = np.var(region_s)
                        
                        # High variance in supposedly uniform regions
                        if h_var > 400 or s_var > 1600:
                            score += 6
                            issues.append("Color inconsistency in uniform regions")
                            break
            
            confidence = min(85, 55 + len(issues) * 6)
            return min(100.0, score), confidence, issues
            
        except Exception as e:
            logger.warning(f"Color analysis error: {str(e)}")
            return 0.0, 0.0, []
    
    def _analyze_noise_patterns(self, gray_image: np.ndarray) -> Tuple[float, float, List[str]]:
        """📊 Analyze noise patterns for manipulation indicators"""
        try:
            issues = []
            score = 0.0
            
            # Noise level analysis
            denoised = cv2.bilateralFilter(gray_image, 9, 75, 75)
            noise = cv2.subtract(gray_image, denoised)
            noise_level = np.std(noise)
            
            # Too clean (might indicate over-processing)
            if noise_level < 3:
                score += 15
                issues.append("Unusually low noise levels - possible over-processing")
            
            # Too noisy
            elif noise_level > 30:
                score += 12
                issues.append("High noise levels detected")
            
            # Noise distribution analysis
            noise_hist, _ = np.histogram(noise.flatten(), bins=256, range=[-128, 128])
            
            # Gaussian noise should be centered around zero
            noise_mean = np.mean(noise)
            if abs(noise_mean) > 5:
                score += 8
                issues.append("Non-zero mean noise detected - possible processing artifacts")
            
            # Texture analysis using Local Binary Pattern approximation
            # Simple LBP-like analysis
            height, width = gray_image.shape
            texture_patterns = []
            
            for y in range(1, height-1, 10):  # Sample every 10 pixels
                for x in range(1, width-1, 10):
                    center = gray_image[y, x]
                    neighbors = [
                        gray_image[y-1, x-1], gray_image[y-1, x], gray_image[y-1, x+1],
                        gray_image[y, x+1], gray_image[y+1, x+1], gray_image[y+1, x],
                        gray_image[y+1, x-1], gray_image[y, x-1]
                    ]
                    
                    # Simple pattern encoding
                    pattern = sum(1 << i for i, neighbor in enumerate(neighbors) if neighbor >= center)
                    texture_patterns.append(pattern)
            
            if texture_patterns:
                # Analyze texture pattern distribution
                unique_patterns = len(set(texture_patterns))
                pattern_entropy = len(texture_patterns) / max(unique_patterns, 1)
                
                # Artificial texture patterns
                if pattern_entropy < 2:
                    score += 10
                    issues.append("Artificial texture patterns detected")
            
            # Frequency domain analysis
            f_transform = np.fft.fft2(gray_image)
            f_shift = np.fft.fftshift(f_transform)
            magnitude_spectrum = np.log(np.abs(f_shift) + 1)
            
            # Analyze frequency distribution
            height, width = magnitude_spectrum.shape
            center_y, center_x = height // 2, width // 2
            
            # Create rings for radial frequency analysis
            y, x = np.ogrid[:height, :width]
            distances = np.sqrt((x - center_x)**2 + (y - center_y)**2)
            
            # Analyze different frequency bands
            low_freq = magnitude_spectrum[distances <= min(height, width) * 0.1]
            mid_freq = magnitude_spectrum[(distances > min(height, width) * 0.1) & 
                                        (distances <= min(height, width) * 0.3)]
            high_freq = magnitude_spectrum[distances > min(height, width) * 0.3]
            
            if len(low_freq) > 0 and len(high_freq) > 0:
                low_freq_energy = np.mean(low_freq)
                high_freq_energy = np.mean(high_freq)
                
                # Unusual frequency distribution
                freq_ratio = high_freq_energy / max(low_freq_energy, 0.001)
                if freq_ratio > 2 or freq_ratio < 0.1:
                    score += 8
                    issues.append("Unusual frequency domain characteristics")
            
            confidence = min(82, 50 + len(issues) * 8)
            return min(100.0, score), confidence, issues
            
        except Exception as e:
            logger.warning(f"Noise analysis error: {str(e)}")
            return 0.0, 0.0, []
    
    def _analyze_document_structure(self, image: np.ndarray, document_type: str) -> Tuple[float, float, List[str]]:
        """📋 Analyze document structure and layout consistency"""
        try:
            issues = []
            score = 0.0
            
            height, width = image.shape[:2]
            
            # Expected aspect ratios for different document types
            aspect_ratios = {
                'aadhaar': (1.6, 1.9),  # Typical range
                'pan': (1.4, 1.7),
                'passport': (1.3, 1.5)
            }
            
            current_aspect = width / height
            expected_range = aspect_ratios.get(document_type, (1.2, 2.0))
            
            if not (expected_range[0] <= current_aspect <= expected_range[1]):
                score += 15
                issues.append(f"Unusual aspect ratio for {document_type} document")
            
            # Document size analysis
            if width < 300 or height < 200:
                score += 10
                issues.append("Unusually small document dimensions")
            elif width > 4000 or height > 3000:
                score += 8
                issues.append("Unusually large document dimensions")
            
            # Border and margin analysis
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image
            
            # Check document borders
            border_width = min(width, height) // 20
            
            # Top, bottom, left, right borders
            top_border = gray[:border_width, :]
            bottom_border = gray[-border_width:, :]
            left_border = gray[:, :border_width]
            right_border = gray[:, -border_width:]
            
            border_means = [
                np.mean(top_border),
                np.mean(bottom_border),
                np.mean(left_border),
                np.mean(right_border)
            ]
            
            # Borders should typically be light (background)
            border_mean = np.mean(border_means)
            if border_mean < 180:  # Dark borders might indicate cropping issues
                score += 8
                issues.append("Unusual border characteristics detected")
            
            # Document orientation analysis
            # Find dominant lines in the document
            edges = cv2.Canny(gray, 50, 150)
            lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=100)
            
            if lines is not None and len(lines) > 0:
                angles = []
                for line in lines[:20]:  # Analyze top 20 lines
                    rho, theta = line[0]
                    angle = theta * 180 / np.pi
                    angles.append(angle)
                
                # Check for consistent horizontal/vertical alignment
                horizontal_angles = [a for a in angles if abs(a - 0) < 10 or abs(a - 180) < 10]
                vertical_angles = [a for a in angles if abs(a - 90) < 10]
                
                if len(horizontal_angles) + len(vertical_angles) < len(angles) * 0.6:
                    score += 12
                    issues.append("Document appears skewed or rotated")
            
            # Template matching for document type (basic)
            if document_type in ['aadhaar', 'pan']:
                # Check for typical text regions
                # This is a simplified approach - in practice, you'd use more sophisticated template matching
                
                # Look for rectangular regions that might contain text
                contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                
                text_like_regions = 0
                for contour in contours:
                    x, y, w, h = cv2.boundingRect(contour)
                    aspect = w / max(h, 1)
                    area = cv2.contourArea(contour)
                    
                    # Text regions are typically rectangular with certain aspect ratios
                    if 2 <= aspect <= 15 and 100 <= area <= 10000:
                        text_like_regions += 1
                
                # Too few text-like regions
                if text_like_regions < 3:
                    score += 10
                    issues.append(f"Insufficient text regions for typical {document_type} document")
            
            confidence = min(80, 60 + len(issues) * 5)
            return min(100.0, score), confidence, issues
            
        except Exception as e:
            logger.warning(f"Structure analysis error: {str(e)}")
            return 0.0, 0.0, []
    
    def _generate_ai_insights(self, detection_result: Dict[str, Any]) -> List[str]:
        """🧠 Generate AI-powered insights and recommendations"""
        insights = []
        
        score = detection_result['manipulation_score']
        detected_issues = detection_result['detected_issues']
        confidence = detection_result['confidence']
        
        # Score-based insights
        if score >= 80:
            insights.append("🚨 High probability of document manipulation - immediate review recommended")
        elif score >= 60:
            insights.append("⚠️ Moderate manipulation risk - additional verification suggested")
        elif score >= 30:
            insights.append("⚡ Some anomalies detected - consider enhanced validation")
        else:
            insights.append("✅ Document appears authentic based on current analysis")
        
        # Issue-specific insights
        if any("compression" in issue.lower() for issue in detected_issues):
            insights.append("💾 Compression artifacts suggest possible digital manipulation")
        
        if any("edge" in issue.lower() for issue in detected_issues):
            insights.append("📐 Edge inconsistencies may indicate copy-paste operations")
        
        if any("font" in issue.lower() or "text" in issue.lower() for issue in detected_issues):
            insights.append("🔤 Text rendering anomalies suggest possible field modification")
        
        if any("lighting" in issue.lower() or "shadow" in issue.lower() for issue in detected_issues):
            insights.append("💡 Lighting inconsistencies may indicate composite image creation")
        
        if any("color" in issue.lower() for issue in detected_issues):
            insights.append("🌈 Color distribution anomalies suggest digital processing")
        
        # Confidence-based insights
        if confidence < 50:
            insights.append("❓ Low analysis confidence - consider manual expert review")
        elif confidence > 85:
            insights.append("✨ High confidence in analysis results")
        
        # Recommendation based on overall assessment
        if score >= 70 and confidence >= 60:
            insights.append("🔍 Strong recommendation: Flag for manual expert verification")
        elif score >= 40 and confidence >= 70:
            insights.append("📋 Moderate recommendation: Additional document validation advised")
        
        return insights[:6]  # Limit to top 6 insights


class BehaviorAnalyzer:
    """
    🎯 Advanced Behavioral Analysis and Pattern Recognition System
    
    Analyzes user behavior patterns and document submission patterns
    to identify potential fraudulent activities
    """
    
    def __init__(self):
        """Initialize behavioral analysis system"""
        
        self.suspicious_patterns = {
            'rapid_submissions': 5,      # More than 5 docs in short time
            'duplicate_data': 0.8,       # 80% similarity threshold
            'unusual_timing': [0, 6],    # Submissions between midnight and 6 AM
            'velocity_threshold': 10,    # Documents per hour
        }
        
        logger.info("✅ Behavioral Analysis System initialized")
    
    def analyze_submission_behavior(self, user_records: List[Dict], current_record: Dict) -> Dict[str, Any]:
        """🕵️ Analyze user submission behavior for fraud indicators"""
        try:
            behavior_score = 0.0
            risk_indicators = []
            patterns_detected = []
            
            if not user_records:
                return {
                    'behavior_score': 0.0,
                    'risk_indicators': [],
                    'patterns_detected': ['first_submission'],
                    'risk_level': 'low'
                }
            
            # 1. Submission velocity analysis
            now = datetime.utcnow()
            recent_submissions = []
            
            for record in user_records:
                try:
                    if isinstance(record.get('processed_at'), str):
                        processed_time = datetime.fromisoformat(record['processed_at'])
                    else:
                        processed_time = record.get('processed_at', now)
                    
                    time_diff = (now - processed_time).total_seconds() / 3600  # Hours
                    if time_diff <= 24:  # Last 24 hours
                        recent_submissions.append(record)
                except (ValueError, TypeError):
                    continue
            
            # Rapid submission detection
            if len(recent_submissions) >= self.suspicious_patterns['rapid_submissions']:
                behavior_score += 25
                risk_indicators.append(f"Rapid document submissions: {len(recent_submissions)} in 24 hours")
                patterns_detected.append('rapid_submissions')
            
            # 2. Document similarity analysis
            current_fields = current_record.get('extracted_fields', {})
            
            for record in user_records[-10:]:  # Check last 10 records
                record_fields = record.get('extracted_fields', {})
                
                similarity = self._calculate_field_similarity(current_fields, record_fields)
                if similarity > self.suspicious_patterns['duplicate_data']:
                    behavior_score += 20
                    risk_indicators.append(f"High similarity with previous submission: {similarity:.1%}")
                    patterns_detected.append('duplicate_data')
                    break
            
            # 3. Timing pattern analysis
            submission_hours = []
            for record in user_records:
                try:
                    if isinstance(record.get('processed_at'), str):
                        processed_time = datetime.fromisoformat(record['processed_at'])
                    else:
                        processed_time = record.get('processed_at', now)
                    
                    submission_hours.append(processed_time.hour)
                except:
                    continue
            
            # Check for unusual timing patterns
            night_submissions = sum(1 for hour in submission_hours 
                                  if self.suspicious_patterns['unusual_timing'][0] <= hour <= self.suspicious_patterns['unusual_timing'][1])
            
            if len(submission_hours) > 0:
                night_ratio = night_submissions / len(submission_hours)
                if night_ratio > 0.6:  # More than 60% of submissions at night
                    behavior_score += 15
                    risk_indicators.append("Unusual submission timing pattern (predominantly night hours)")
                    patterns_detected.append('unusual_timing')
            
            # 4. Document type pattern analysis
            doc_types = [record.get('document_type', 'unknown') for record in user_records]
            doc_type_counts = {}
            for doc_type in doc_types:
                doc_type_counts[doc_type] = doc_type_counts.get(doc_type, 0) + 1
            
            # Multiple submissions of same document type
            for doc_type, count in doc_type_counts.items():
                if count > 3:  # More than 3 of same document type
                    behavior_score += 10
                    risk_indicators.append(f"Multiple {doc_type} document submissions: {count}")
                    patterns_detected.append('repeated_document_type')
            
            # 5. Name consistency analysis across submissions
            names_used = []
            for record in user_records:
                extracted_name = record.get('extracted_fields', {}).get('name', '')
                entered_name = record.get('user_entered_name', '')
                
                if extracted_name:
                    names_used.append(extracted_name.lower().strip())
                if entered_name:
                    names_used.append(entered_name.lower().strip())
            
            # Check for name variations
            unique_names = set(names_used)
            if len(unique_names) > 2 and len(names_used) > 0:
                name_variation_ratio = len(unique_names) / len(names_used)
                if name_variation_ratio > 0.5:  # High name variation
                    behavior_score += 18
                    risk_indicators.append("High name variation across submissions")
                    patterns_detected.append('name_inconsistency')
            
            # 6. Fraud score progression analysis
            fraud_scores = [record.get('fraud_score', 0) for record in user_records if record.get('fraud_score') is not None]
            
            if len(fraud_scores) >= 3:
                # Check if fraud scores are improving suspiciously
                recent_scores = fraud_scores[-3:]
                if all(recent_scores[i] < recent_scores[i-1] for i in range(1, len(recent_scores))):
                    avg_improvement = (recent_scores[0] - recent_scores[-1]) / len(recent_scores)
                    if avg_improvement > 15:  # Significant improvement
                        behavior_score += 12
                        risk_indicators.append("Suspicious improvement in document quality scores")
                        patterns_detected.append('score_manipulation')
            
            # Determine risk level
            if behavior_score >= 50:
                risk_level = 'high'
            elif behavior_score >= 25:
                risk_level = 'medium'
            else:
                risk_level = 'low'
            
            return {
                'behavior_score': round(min(100.0, behavior_score), 1),
                'risk_indicators': risk_indicators,
                'patterns_detected': patterns_detected,
                'risk_level': risk_level,
                'analysis_details': {
                    'total_submissions': len(user_records),
                    'recent_submissions_24h': len(recent_submissions),
                    'unique_names_used': len(unique_names) if 'names_used' in locals() else 0,
                    'document_types': doc_type_counts
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Behavioral analysis failed: {str(e)}")
            return {
                'behavior_score': 0.0,
                'risk_indicators': [f"Analysis failed: {str(e)}"],
                'patterns_detected': ['analysis_error'],
                'risk_level': 'unknown'
            }
    
    def _calculate_field_similarity(self, fields1: Dict[str, str], fields2: Dict[str, str]) -> float:
        """📊 Calculate similarity between two sets of extracted fields"""
        try:
            if not fields1 or not fields2:
                return 0.0
            
            common_fields = set(fields1.keys()).intersection(set(fields2.keys()))
            if not common_fields:
                return 0.0
            
            matches = 0
            total = 0
            
            for field in common_fields:
                value1 = str(fields1[field]).lower().strip()
                value2 = str(fields2[field]).lower().strip()
                
                if value1 and value2:
                    total += 1
                    if value1 == value2:
                        matches += 1
                    else:
                        # Fuzzy matching for names
                        if field == 'name':
                            from fuzzywuzzy import fuzz
                            similarity = fuzz.ratio(value1, value2) / 100
                            if similarity > 0.8:
                                matches += similarity
                        # Exact match for numbers
                        elif field in ['aadhaar_number', 'pan_number']:
                            if value1 == value2:
                                matches += 1
            
            return matches / total if total > 0 else 0.0
            
        except Exception as e:
            logger.warning(f"Field similarity calculation error: {str(e)}")
            return 0.0
    
    def analyze_fraud_patterns(self, records: List[Dict], pattern_type: str = 'comprehensive') -> Dict[str, Any]:
        """🔍 Analyze patterns across multiple records for fraud detection"""
        try:
            pattern_analysis = {
                'total_records': len(records),
                'suspicious_patterns': [],
                'risk_distribution': {'low': 0, 'medium': 0, 'high': 0},
                'fraud_indicators': defaultdict(int),
                'recommendations': []
            }
            
            if not records:
                return pattern_analysis
            
            # Analyze fraud score distribution
            fraud_scores = [record.get('fraud_score', 0) for record in records if record.get('fraud_score') is not None]
            
            for score in fraud_scores:
                if score >= 70:
                    pattern_analysis['risk_distribution']['high'] += 1
                elif score >= 40:
                    pattern_analysis['risk_distribution']['medium'] += 1
                else:
                    pattern_analysis['risk_distribution']['low'] += 1
            
            # Pattern detection
            if len(fraud_scores) >= 3:
                avg_fraud_score = statistics.mean(fraud_scores)
                fraud_score_trend = self._calculate_trend(fraud_scores[-5:])  # Last 5 scores
                
                if avg_fraud_score > 50:
                    pattern_analysis['suspicious_patterns'].append('high_average_fraud_score')
                    pattern_analysis['recommendations'].append('Enhanced verification recommended for this user')
                
                if fraud_score_trend < -10:  # Improving trend might be suspicious
                    pattern_analysis['suspicious_patterns'].append('suspiciously_improving_scores')
                    pattern_analysis['recommendations'].append('Investigate potential gaming of the system')
            
            # Analyze common fraud indicators
            all_risk_factors = []
            for record in records:
                if record.get('risk_factors'):
                    all_risk_factors.extend(record['risk_factors'])
            
            for factor in all_risk_factors:
                pattern_analysis['fraud_indicators'][factor] += 1
            
            # Document type analysis
            doc_types = [record.get('document_type', 'unknown') for record in records]
            doc_type_counts = defaultdict(int)
            for doc_type in doc_types:
                doc_type_counts[doc_type] += 1
            
            # Check for unusual document type patterns
            total_docs = len(doc_types)
            for doc_type, count in doc_type_counts.items():
                ratio = count / total_docs
                if ratio > 0.8 and total_docs >= 5:  # More than 80% same document type
                    pattern_analysis['suspicious_patterns'].append(f'excessive_{doc_type}_submissions')
                    pattern_analysis['recommendations'].append(f'Review multiple {doc_type} submissions')
            
            return pattern_analysis
            
        except Exception as e:
            logger.error(f"❌ Pattern analysis failed: {str(e)}")
            return {
                'total_records': 0,
                'suspicious_patterns': ['analysis_error'],
                'error': str(e)
            }
    
    def _calculate_trend(self, values: List[float]) -> float:
        """📈 Calculate trend direction in a series of values"""
        if len(values) < 2:
            return 0.0
        
        try:
            # Simple linear regression slope
            n = len(values)
            x = list(range(n))
            
            x_mean = statistics.mean(x)
            y_mean = statistics.mean(values)
            
            numerator = sum((x[i] - x_mean) * (values[i] - y_mean) for i in range(n))
            denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
            
            if denominator == 0:
                return 0.0
            
            slope = numerator / denominator
            return slope
            
        except Exception as e:
            logger.warning(f"Trend calculation error: {str(e)}")
            return 0.0

# Export classes for use in other modules
__all__ = ['AdvancedFraudDetector', 'BehaviorAnalyzer']
