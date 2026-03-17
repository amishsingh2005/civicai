import requests
import os

def test_create_report():
    url = "http://127.0.0.1:8000/reports/create"
    image_path = r"C:\Users\adity\.gemini\antigravity\brain\a5bcf5ae-5b7d-41cd-8651-a1b4f5996377\pothole_avenue_road_1773758816130.png"
    
    if not os.path.exists(image_path):
        print(f"Image not found at {image_path}")
        return

    data = {
        "user_id": "test_user_123",
        "latitude": 13.0827,
        "longitude": 80.2707,
        "description": "Test report from script"
    }

    with open(image_path, "rb") as img_file:
        files = {"image": ("pothole.png", img_file, "image/png")}
        try:
            response = requests.post(url, data=data, files=files)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_create_report()
