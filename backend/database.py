import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
CLIENT_NAME = "civicai_db"

client = AsyncIOMotorClient(MONGO_URI)
db = client[CLIENT_NAME]
users_collection = db["users"]
reports_collection = db["reports"]
votes_collection = db["votes"]

# Supabase initialization
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

async def init_db():
    # Create geospatial index for location-based search
    await reports_collection.create_index([("location", "2dsphere")])
    # Create index for votes to ensure unique user per report
    await votes_collection.create_index([("user_id", 1), ("report_id", 1)], unique=True)
    print("Database indexes initialized.")
