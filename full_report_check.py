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
    
    print(f"{'ID':<30} | {'User':<20} | {'Issue':<15} | {'Count':<5} | {'Created'}")
    print("-" * 85)
    cursor = reports_collection.find().sort("created_at", -1)
    async for report in cursor:
        print(f"{str(report['_id']):<30} | {str(report.get('user_id')):<20} | {str(report.get('issue_type')):<15} | {report.get('report_count', 1):<5} | {report.get('created_at')}")

if __name__ == "__main__":
    asyncio.run(check_reports())
