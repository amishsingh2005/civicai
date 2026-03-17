import requests
import os
import json
import random

def test_create_report():
    url = "http://127.0.0.1:8000/reports/create"
    image_path = r"C:\Users\adity\.gemini\antigravity\brain\a5bcf5ae-5b7d-41cd-8651-a1b4f5996377\pothole_avenue_road_1773758816130.png"

    # Randomize coordinates to avoid merging
    lat = 13.0 + random.uniform(0.1, 0.5)
    lng = 80.0 + random.uniform(0.1, 0.5)

    data = {
        "user_id": f"user_{random.randint(100, 999)}",
        "latitude": lat,
        "longitude": lng,
        "description": "Unique report for Monarch debugging"
    }

    with open(image_path, "rb") as img_file:
        files = {"image": ("debug_image.png", img_file, "image/png")}
        try:
            response = requests.post(url, data=data, files=files)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_create_report()
