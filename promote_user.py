
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def promote_user():
    mongo_uri = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(mongo_uri)
    db = client.civicai_db
    users = db.users
    
    result = await users.update_one(
        {"email": "amish@gmail.com"},
        {"$set": {"role": "admin"}}
    )
    
    if result.modified_count > 0:
        print("User amish@gmail.com promoted to admin.")
    else:
        print("User not found or already admin.")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(promote_user())
