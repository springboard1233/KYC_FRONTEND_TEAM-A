#!/usr/bin/env python3
"""
Enhanced OCR testing script with debugging
"""

import sys
import os
import logging
import json

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.ocr import OCRProcessor

# Enable detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def test_ocr_with_debug(image_path, doc_type):
    """Test OCR with detailed debugging"""
    
    print("=" * 60)
    print("ENHANCED OCR TESTING WITH DEBUGGING")
    print("=" * 60)
    
    # Check if file exists
    if not os.path.exists(image_path):
        print(f"❌ ERROR: File not found: {image_path}")
        return 1
    
    print(f"📁 Testing file: {image_path}")
    print(f"📄 Document type: {doc_type}")
    print(f"📊 File size: {os.path.getsize(image_path)} bytes")
    
    # Initialize OCR processor
    try:
        processor = OCRProcessor()
        print("✅ OCR processor initialized successfully")
    except Exception as e:
        print(f"❌ ERROR: Failed to initialize OCR processor: {e}")
        return 1
    
    # Process document
    print("\n🔄 Starting OCR processing...")
    result = processor.process_document(image_path, doc_type)
    
    # Display results
    print("\n📋 RESULTS:")
    print("=" * 40)
    if result['success']:
        print("✅ SUCCESS: OCR processing completed")
        print(f"🎯 Confidence Score: {result['confidence_score']}%")
        print(f"⏰ Processing Time: {result['processing_timestamp']}")
        
        print(f"\n📄 Extracted Fields:")
        for field, value in result['extracted_fields'].items():
            print(f"  {field}: {value}")
        
        print(f"\n📝 Raw Text Preview:")
        raw_text = result.get('raw_text', '')[:500]  # First 500 chars
        print(f"'{raw_text}'...")
        
    else:
        print("❌ FAILED: OCR processing failed")
        print(f"🚫 Error: {result['error']}")
    
    # Save full results
    output_file = f"ocr_test_results_{doc_type}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    print(f"\n💾 Full results saved to: {output_file}")
    
    return 0 if result['success'] else 1


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_ocr_cli.py <image_path> [doc_type]")
        print("Example: python test_ocr_cli.py ../data/practice_samples/practice_aadhaar_1.png aadhaar")
        sys.exit(1)
    
    image_path = sys.argv[1]
    doc_type = sys.argv[2] if len(sys.argv) > 2 else "aadhaar"  # ✅ fallback
    
    sys.exit(test_ocr_with_debug(image_path, doc_type))
