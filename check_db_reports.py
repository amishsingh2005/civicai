import motor.motor_asyncio
import asyncio
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

async def check_reports():
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = motor.motor_asyncio.AsyncIOMotorClient(mongo_uri)
    db = client["civicai_db"]
    reports_collection = db["reports"]
    
    print("Fetching last 5 reports...")
    cursor = reports_collection.find().sort("created_at", -1).limit(5)
    async for report in cursor:
        print("-" * 50)
        print(f"ID: {report['_id']}")
        print(f"Issue: {report.get('issue_type')}")
        print(f"Image: {report.get('image_url')}")
        print(f"Created: {report.get('created_at')}")
        print(f"Count: {report.get('report_count')}")

if __name__ == "__main__":
    asyncio.run(check_reports())
