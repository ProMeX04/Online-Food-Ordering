#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script to automatically generate detailed dish data and images using a hypothetical Gemini API.

This script reads a list of Vietnamese dish names, then for each dish:
1.  Generates a detailed description, estimated price, category, and other relevant data using Gemini's text generation capabilities.
2.  Generates a representative image for the dish using Gemini's image generation capabilities.
3.  Saves the generated data into a JSON file and the images into a specified directory.

**Prerequisites:**
- Python 3.7+
- A hypothetical Gemini Python client library installed (`pip install google-generativeai` - assuming this is the library)
- A Gemini API Key set as an environment variable or configured directly.
- A text file named 'vietnamese_dishes.txt' in the same directory, with one dish name per line.

**Note:** The Gemini API calls are placeholders. You need to replace the placeholder functions (`call_gemini_text_api`, `call_gemini_image_api`) with actual calls to the Gemini API using your preferred library (e.g., google-generativeai).
"""

import os
import json
import random
import time
import re
# import google.generativeai as genai # Hypothetical import

# --- Configuration ---
# TODO: Configure your Gemini API Key
# genai.configure(api_key="YOUR_GEMINI_API_KEY") # Replace with your actual API key or use environment variables

INPUT_DISH_LIST_FILE = "vietnamese_dishes.txt"
OUTPUT_JSON_FILE = "generated_dishes_data.json"
OUTPUT_IMAGE_DIR = "generated_dish_images"

# --- Placeholder Gemini API Functions ---


def call_gemini_text_api(prompt):
    """Placeholder function to simulate calling Gemini for text generation."""
    print(f"\n--- Simulating Gemini Text API Call ---")
    print(f"Prompt: {prompt}")
    # Simulate API delay
    time.sleep(random.uniform(0.5, 1.5))

    # Simulate generating structured data (this would come from Gemini)
    # Extract dish name from prompt for more realistic simulation
    dish_name_match = re.search(r"Món ăn: (.+?)\n", prompt)
    dish_name_for_sim = dish_name_match.group(
        1) if dish_name_match else "Món ăn không xác định"

    simulated_data = {
        "description": f"Đây là mô tả chi tiết và hấp dẫn cho món {dish_name_for_sim}, được tạo tự động.",
        "category": random.choice(["Món chính", "Món khai vị", "Món ăn vặt", "Bún/Phở/Mì", "Cơm", "Bánh", "Chè", "Đồ uống", "Đặc sản"]),
        "estimated_price_vnd": random.randint(30, 250) * 1000,
        "main_ingredients": ["Thành phần 1", "Thành phần 2", f"Nguyên liệu đặc trưng của {dish_name_for_sim}"],
        "region": random.choice(["Miền Bắc", "Miền Trung", "Miền Nam", "Khắp cả nước", "Không xác định"]),
        "rating_estimate": round(random.uniform(3.5, 5.0), 1)
    }
    print(f"Simulated Response: {simulated_data}")
    print(f"--- End Simulation ---")
    # In a real scenario, you would parse the Gemini response here
    # Handle potential errors from the API
    return simulated_data


def call_gemini_image_api(prompt, save_path):
    """Placeholder function to simulate calling Gemini for image generation."""
    print(f"\n--- Simulating Gemini Image API Call ---")
    print(f"Prompt: {prompt}")
    print(f"Target Save Path: {save_path}")
    # Simulate API delay
    time.sleep(random.uniform(1.0, 3.0))

    # Simulate saving a placeholder image (e.g., create a dummy file)
    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        # Create a dummy file to represent the image
        with open(save_path, 'w') as f:
            f.write(f"Placeholder image for: {prompt}")
        print(f"Simulated image saved to: {save_path}")
        print(f"--- End Simulation ---")
        return save_path  # Return the path where the image was 'saved'
    except Exception as e:
        print(f"Error simulating image save for {prompt}: {e}")
        print(f"--- End Simulation (Error) ---")
        return None

# --- Helper Functions ---


def sanitize_filename(name):
    """Removes or replaces characters invalid for filenames."""
    # Remove leading/trailing whitespace
    name = name.strip()
    # Replace spaces with underscores
    name = name.replace(" ", "_")
    # Remove characters that are problematic in filenames
    name = re.sub(r'[\/*?:

<>|\\]+

    name = name.lower() # Convert to lowercase for consistency
    return name

# --- Main Execution Logic --- 

def main():
    """Main function to orchestrate the data and image generation process."""
    print("Starting dish data and image generation process...")

    # --- 1. Read Dish Names ---
    try:
        with open(INPUT_DISH_LIST_FILE, 'r', encoding='utf-8') as f:
            dish_names = [line.strip() for line in f if line.strip()]
        print(f"Successfully read {len(dish_names)} dish names from {INPUT_DISH_LIST_FILE}.")
    except FileNotFoundError:
        print(f"Error: Input file 	'{INPUT_DISH_LIST_FILE}	' not found. Please create it with one dish name per line.")
        return
    except Exception as e:
        print(f"Error reading {INPUT_DISH_LIST_FILE}: {e}")
        return

    if not dish_names:
        print("Error: No dish names found in the input file.")
        return

    # --- 2. Create Output Directory for Images ---
    try:
        os.makedirs(OUTPUT_IMAGE_DIR, exist_ok=True)
        print(f"Output directory for images: 	'{OUTPUT_IMAGE_DIR}	'")
    except Exception as e:
        print(f"Error creating image directory 	'{OUTPUT_IMAGE_DIR}	': {e}")
        return # Stop if we can't create the image directory

    # --- 3. Process Each Dish ---
    all_dishes_data = []
    for i, dish_name in enumerate(dish_names):
        print(f"\nProcessing dish {i+1}/{len(dish_names)}: {dish_name}")

        # --- Generate Text Data ---
        text_prompt = (
            f"Món ăn: {dish_name}\n"
            f"Hãy tạo dữ liệu chi tiết cho món ăn Việt Nam này, bao gồm:
"
            f"- description: Mô tả chi tiết, hấp dẫn về món ăn (khoảng 2-3 câu).
"
            f"- category: Phân loại món ăn (ví dụ: Món chính, Món khai vị, Bún/Phở/Mì, Cơm, Bánh, Chè, Đồ uống, Đặc sản, Món ăn vặt).
"
            f"- estimated_price_vnd: Mức giá ước lượng phổ biến tại Việt Nam (đơn vị VND).
"
            f"- main_ingredients: Liệt kê 3-5 nguyên liệu chính.
"
            f"- region: Vùng miền phổ biến (Miền Bắc, Miền Trung, Miền Nam, Khắp cả nước).
"
            f"- rating_estimate: Điểm đánh giá ước lượng (từ 1.0 đến 5.0).
"
            f"Trả về kết quả dưới dạng JSON."
        )
        generated_data = call_gemini_text_api(text_prompt)

        if not generated_data:
            print(f"Skipping image generation for {dish_name} due to text generation failure.")
            continue # Move to the next dish if text data failed

        # Add the original name to the data
        generated_data["name"] = dish_name

        # --- Generate Image ---
        image_prompt = f"Hình ảnh món ăn Việt Nam: {dish_name}, phong cách ẩm thực chân thực, hấp dẫn, ánh sáng tự nhiên, chất lượng cao."
        sanitized_name = sanitize_filename(dish_name)
        image_filename = f"{sanitized_name}.jpg" # Assume JPG output, adjust if needed
        image_save_path = os.path.join(OUTPUT_IMAGE_DIR, image_filename)
        
        generated_image_path = call_gemini_image_api(image_prompt, image_save_path)

        # Add image path to the data (relative path is often better for portability)
        if generated_image_path:
            # Use relative path from the perspective of the JSON file location
            generated_data["imageUrl"] = os.path.join(os.path.basename(OUTPUT_IMAGE_DIR), image_filename)
        else:
            generated_data["imageUrl"] = None # Indicate image generation failed
            print(f"Failed to generate image for {dish_name}.")

        all_dishes_data.append(generated_data)
        
        # Optional: Add a small delay between dishes to avoid hitting API rate limits
        # time.sleep(random.uniform(0.2, 0.5))

    # --- 4. Save All Data to JSON ---
    try:
        with open(OUTPUT_JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_dishes_data, f, ensure_ascii=False, indent=4)
        print(f"\nSuccessfully generated data for {len(all_dishes_data)} dishes.")
        print(f"All data saved to: {OUTPUT_JSON_FILE}")
        print(f"Images saved in directory: {OUTPUT_IMAGE_DIR}")
    except Exception as e:
        print(f"Error writing final JSON data to {OUTPUT_JSON_FILE}: {e}")

    print("\nProcess finished.")

if __name__ == "__main__":
    main()

