
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def check_user():
    mongo_uri = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(mongo_uri)
    db = client.civicai_db
    users = db.users
    
    user = await users.find_one({"email": "amish@gmail.com"})
    if user:
        print(f"User found: {user['email']}, Role: {user['role']}")
    else:
        print("User amish@gmail.com not found in database.")
    
    # List all users
    print("\nAll users:")
    async for u in users.find():
        print(f"- {u['email']} ({u['role']})")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_user())
