#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Generate geometric shield logo for CreditSense"""

from PIL import Image, ImageDraw
import math

def create_geometric_shield_logo():
    """Create a modern geometric shield logo with upward arrow"""
    
    # Create image with transparent background
    size = 512
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Colors
    indigo = (79, 70, 229, 255)  # Deep indigo #4F46E5
    gold = (255, 193, 7, 255)     # Gold accent
    emerald = (16, 185, 129, 255) # Emerald green accent
    white = (255, 255, 255, 255)  # White
    
    center_x = size / 2
    center_y = size / 2
    shield_radius = 140
    
    # Draw geometric hexagonal shield
    # Define hexagon points (shield shape)
    points = []
    for i in range(6):
        angle = (i * 60 - 90) * math.pi / 180
        if i == 5:  # Bottom point extends further
            x = center_x + shield_radius * 1.15 * math.cos(angle)
            y = center_y + shield_radius * 1.15 * math.sin(angle)
        else:
            x = center_x + shield_radius * math.cos(angle)
            y = center_y + shield_radius * math.sin(angle)
        points.append((x, y))
    
    # Draw shield filled
    draw.polygon(points, fill=indigo, outline=white)
    
    # Draw inner border (lighter)
    inner_points = []
    for i in range(6):
        angle = (i * 60 - 90) * math.pi / 180
        if i == 5:
            radius = shield_radius * 1.10
        else:
            radius = shield_radius * 0.95
        x = center_x + radius * math.cos(angle)
        y = center_y + radius * math.sin(angle)
        inner_points.append((x, y))
    
    draw.polygon(inner_points, fill=indigo, outline=(100, 90, 200, 255))
    
    # Draw upward trend arrow inside shield
    arrow_width = 40
    arrow_base_y = center_y + 40
    arrow_tip_y = center_y - 60
    arrow_left_x = center_x - arrow_width / 2
    arrow_right_x = center_x + arrow_width / 2
    
    # Arrow shaft
    shaft_width = 20
    shaft_points = [
        (center_x - shaft_width / 2, arrow_base_y),
        (center_x + shaft_width / 2, arrow_base_y),
        (center_x + shaft_width / 2, arrow_tip_y + 25),
        (center_x - shaft_width / 2, arrow_tip_y + 25)
    ]
    draw.polygon(shaft_points, fill=gold)
    
    # Arrow head (triangle)
    head_size = 35
    arrow_head = [
        (center_x, arrow_tip_y),  # Top point
        (center_x - head_size / 2, arrow_tip_y + 25),  # Bottom left
        (center_x + head_size / 2, arrow_tip_y + 25)   # Bottom right
    ]
    draw.polygon(arrow_head, fill=emerald)
    
    # Add glow effect (emerald halo around arrow tip)
    halo_radius = 15
    draw.ellipse(
        [center_x - halo_radius, arrow_tip_y - halo_radius, 
         center_x + halo_radius, arrow_tip_y + halo_radius],
        outline=emerald,
        width=2
    )
    
    # Draw accent line at bottom of shield
    accent_y = points[5][1] - 20
    draw.line(
        [(center_x - 50, accent_y), (center_x + 50, accent_y)],
        fill=gold,
        width=3
    )
    
    return img

def create_logo_with_text():
    """Create logo with CreditSense text below"""
    
    # Create the shield logo
    shield_img = create_geometric_shield_logo()
    
    # Create larger canvas for logo + text
    result_img = Image.new('RGBA', (512, 600), (0, 0, 0, 0))
    
    # Paste shield logo
    result_img.paste(shield_img, (0, 0), shield_img)
    
    # Save just the shield first
    shield_img.save('creditsense_logo_shield.png')
    print("Saved: creditsense_logo_shield.png (512x512)")
    
    # Convert to RGB for text rendering
    result_rgb = Image.new('RGB', (512, 600), (255, 255, 255))
    result_rgb.paste(Image.new('RGB', (512, 512), (240, 245, 250)), (0, 0))
    result_rgb.paste(shield_img, (0, 0), shield_img)
    
    # Draw text below logo
    draw = ImageDraw.Draw(result_rgb)
    
    # Try to use a nice font, fall back to default
    try:
        from PIL import ImageFont
        title_font = ImageFont.truetype("arial.ttf", 48)
        tagline_font = ImageFont.truetype("arial.ttf", 20)
    except:
        title_font = ImageFont.load_default()
        tagline_font = ImageFont.load_default()
    
    # Draw text
    title_text = "CreditSense"
    tagline_text = "Intelligent Credit Decisions"
    
    # Measure text for centering
    title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    
    tagline_bbox = draw.textbbox((0, 0), tagline_text, font=tagline_font)
    tagline_width = tagline_bbox[2] - tagline_bbox[0]
    
    # Draw centered text
    title_x = (512 - title_width) / 2
    tagline_x = (512 - tagline_width) / 2
    
    draw.text((title_x, 530), title_text, fill=(79, 70, 229), font=title_font)
    draw.text((tagline_x, 570), tagline_text, fill=(107, 114, 128), font=tagline_font)
    
    # Save full logo
    result_rgb.save('creditsense_logo_full.png')
    print("Saved: creditsense_logo_full.png (512x600)")
    
    # Create icon version (small)
    icon_img = shield_img.resize((256, 256), Image.Resampling.LANCZOS)
    icon_img.save('creditsense_logo_icon.png')
    print("Saved: creditsense_logo_icon.png (256x256)")
    
    # Create square favicon version
    favicon_img = shield_img.resize((128, 128), Image.Resampling.LANCZOS)
    favicon_img.save('creditsense_favicon.png')
    print("Saved: creditsense_favicon.png (128x128)")

if __name__ == "__main__":
    print("Generating CreditSense Geometric Shield Logo...")
    print("=" * 50)
    create_logo_with_text()
    print("=" * 50)
    print("Logo generation complete!")
    print("\nLogo Specifications:")
    print("- Design: Modern Hexagonal Shield")
    print("- Features: Upward trend arrow inside")
    print("- Colors: Deep Indigo, Gold, Emerald Green")
    print("- Style: Enterprise, secure, progressive")
    print("\nGenerated Files:")
    print("1. creditsense_logo_shield.png (512x512)")
    print("2. creditsense_logo_full.png (512x600 with text)")
    print("3. creditsense_logo_icon.png (256x256)")
    print("4. creditsense_favicon.png (128x128)")
