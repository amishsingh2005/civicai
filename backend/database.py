import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
CLIENT_NAME = "civicai_db" # You can change this to your preferred database name

client = AsyncIOMotorClient(MONGO_URI)
db = client[CLIENT_NAME]
users_collection = db["users"]
reports_collection = db["reports"]

async def init_db():
    # Create geospatial index for location-based search
    await reports_collection.create_index([("location", "2dsphere")])
    print("Database indexes initialized.")
