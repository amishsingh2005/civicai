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
    
    count = await reports_collection.count_documents({})
    print(f"Total reports in DB: {count}")
    
    print("\nListing all reports (Last 10):")
    cursor = reports_collection.find().sort("created_at", -1).limit(10)
    async for report in cursor:
        print(f"ID: {report['_id']} | Issue: {report.get('issue_type')} | Image: {report.get('image_url')} | Created: {report.get('created_at')}")

if __name__ == "__main__":
    asyncio.run(check_reports())
