import requests
import os
import json

def test_create_report():
    url = "http://127.0.0.1:8000/reports/create"
    image_path = r"C:\Users\adity\Desktop\Personal Projects\Hackathon\Hacknova-26\civicai\frontend\src\assets\complaints\CIV-12345.png"
    
    if not os.path.exists(image_path):
        # Try another one
        image_path = r"C:\Users\adity\.gemini\antigravity\brain\a5bcf5ae-5b7d-41cd-8651-a1b4f5996377\pothole_avenue_road_1773758816130.png"

    data = {
        "user_id": "test_user_678",
        "latitude": 13.0827,
        "longitude": 80.2707,
        "description": "Verification of Monarch upload"
    }

    with open(image_path, "rb") as img_file:
        files = {"image": ("test_image.png", img_file, "image/png")}
        try:
            response = requests.post(url, data=data, files=files)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_create_report()
