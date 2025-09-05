#!/usr/bin/env python3
"""
Create high-quality test images for OCR
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_high_quality_aadhaar():
    """Create a high-quality test Aadhaar image"""
    
    # Create high-resolution image (300 DPI equivalent)
    width, height = 1200, 800
    img = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(img)
    
    try:
        # Try to use a good font
        title_font = ImageFont.truetype("arial.ttf", 48)
        header_font = ImageFont.truetype("arial.ttf", 32)
        text_font = ImageFont.truetype("arial.ttf", 28)
    except:
        # Fallback to default font
        title_font = ImageFont.load_default()
        header_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
    
    # Header with high contrast
    draw.rectangle([20, 20, width-20, 100], fill='#000080', outline='black', width=2)
    draw.text((40, 45), "आधार / AADHAAR", font=title_font, fill='white')
    
    # Clear, high-contrast text
    y_offset = 150
    text_data = [
        ("Name: RAJESH KUMAR SHARMA", text_font),
        ("DOB: 15/08/1985", text_font),
        ("Gender: Male", text_font),
        ("Aadhaar: 1234 5678 9012", header_font),
    ]
    
    for text, font in text_data:
        draw.text((40, y_offset), text, font=font, fill='black')
        y_offset += 60
    
    # Address
    draw.text((40, y_offset), "Address: House No. 123, Sector 15", text_font, fill='black')
    draw.text((40, y_offset + 40), "Gurgaon, Haryana - 122001", text_font, fill='black')
    
    # Save as high-quality image
    output_path = "../data/practice_samples/high_quality_aadhaar.png"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG', dpi=(300, 300))
    print(f"Created high-quality test image: {output_path}")

if __name__ == "__main__":
    create_high_quality_aadhaar()
