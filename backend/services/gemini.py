import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Create the model
generation_config = {
  "temperature": 0.4,
  "top_p": 1,
  "top_k": 32,
  "max_output_tokens": 1024,
}

model = genai.GenerativeModel(
  model_name="gemini-1.5-flash",
  generation_config=generation_config,
)

async def analyze_image(image_path: str):
    """
    Analyzes an image using Gemini Vision API to detect civic issues.
    """
    try:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found at {image_path}")

        # Upload the file to Gemini
        sample_file = genai.upload_file(path=image_path, display_name="Civic Issue")
        
        # Prompt for analysis
        prompt = """
        Analyze this image and identify the civic issue (e.g., pothole, garbage, water leak, broken street light, etc.).
        Provide the following in a clear format:
        Issue Type: [Single category name]
        Description: [1-2 sentences summarizing the issue]
        Severity: [Low, Medium, or High]
        """

        response = model.generate_content([prompt, sample_file])
        text = response.text

        # Basic parsing of the response
        issue_type = "Other"
        description = "Public issue detected."
        severity = "Medium"

        for line in text.split('\n'):
            if "Issue Type:" in line:
                issue_type = line.split(":", 1)[1].strip()
            elif "Description:" in line:
                description = line.split(":", 1)[1].strip()
            elif "Severity:" in line:
                val = line.split(":", 1)[1].strip().capitalize()
                if val in ["Low", "Medium", "High"]:
                    severity = val

        return {
            "issue_type": issue_type,
            "description": description,
            "severity": severity
        }

    except Exception as e:
        print(f"Gemini API Error: {e}")
        # Fallback values
        return {
            "issue_type": "Civic Issue",
            "description": "A potential civic issue has been reported.",
            "severity": "Medium"
        }
