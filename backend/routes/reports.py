import os
import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from ..database import db, reports_collection, votes_collection
from ..services.gemini import analyze_image
from bson import ObjectId
from pydantic import BaseModel
import aiohttp


class VoteRequest(BaseModel):
    report_id: str
    user_id: str
    vote_type: int # 1 for upvote, -1 for downvote

router = APIRouter(prefix="/reports", tags=["Reports"])

# Directory to store uploads temporarily
UPLOAD_DIR = os.path.join("backend", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def upload_to_monarch(filename: str, file_bytes: bytes) -> str:
    upload_url = "https://api.monarchupload.cc/v3/upload"
    secret = os.getenv("MONARCH_SECRET", "RatUFrFSDWXg")
    print(f"Uploading file to Monarch: {filename} (Secret Length: {len(secret) if secret else 0})")


    form_data = aiohttp.FormData()
    form_data.add_field('secret', secret)
    form_data.add_field('file', file_bytes, filename=filename) # Remove explicit multipart/form-data for the field

    
    async with aiohttp.ClientSession() as session:
        async with session.post(upload_url, data=form_data) as response:
            print(f"Monarch Response Status: {response.status}")
            result = await response.json()
            print(f"Monarch Full Response: {result}")
            
            if response.status != 200:
                print(f"Monarch Upload Failed: {response.status}")
                return None
            
            if "data" in result and "url" in result["data"]:
                return result["data"]["url"]
            return None



@router.post("/create")
async def create_report(
    user_id: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    description: str = Form(None),
    image: UploadFile = File(...)
):
    print(f"\n>>> [CREATE REPORT] User: {user_id}, Loc: ({latitude}, {longitude})")
    try:
        # 1. Handle Image Upload (Temporarily for analysis)
        print("Saving temp file...")

        file_ext = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        content = await image.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        # 2. Check for nearby reports (within 50 meters)
        nearby_report = await reports_collection.find_one({
            "location": {
                "$near": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [longitude, latitude]
                    },
                    "$maxDistance": 50 # 50 meters
                }
            },
            "status": "Open" # Only merge with open reports
        })

        if nearby_report:
            # Merging... clean up temp file
            if os.path.exists(file_path):
                os.remove(file_path)

            await reports_collection.update_one(
                {"_id": nearby_report["_id"]},
                {
                    "$inc": {"report_count": 1},
                    "$set": {"last_updated": datetime.utcnow()}
                }
            )
            return {
                "report_id": str(nearby_report["_id"]),
                "detected_issue": nearby_report["issue_type"],
                "description": nearby_report["description"],
                "severity": nearby_report["severity"],
                "image_url": nearby_report["image_url"],
                "merged": True
            }

        # 3. Process with Gemini
        print("Calling Gemini analysis...")
        analysis = await analyze_image(file_path)
        print(f"Gemini Result: {analysis}")
        
        # 4. Upload to Monarch
        print("Uploading to Monarch...")
        monarch_url = await upload_to_monarch(image.filename, content)
        print(f"Monarch URL: {monarch_url}")
        
        # 5. Clean up temp file
        if os.path.exists(file_path):
            os.remove(file_path)

        if not monarch_url:
            print("ERROR: Monarch URL is empty")
            raise Exception("Failed to upload image to Monarch")

        # If user provided a manual description, we can append or prioritize it
        final_description = description if description else analysis["description"]

        # 6. Save to MongoDB
        print(f"Creating DB Doc: Issue={analysis['issue_type']}, URL={monarch_url[:30]}...")
        report_doc = {

            "user_id": user_id,
            "image_url": monarch_url,
            "issue_type": analysis["issue_type"],
            "description": final_description,
            "severity": analysis["severity"],
            "location": {
                "type": "Point",
                "coordinates": [longitude, latitude]
            },
            "status": "Open",
            "report_count": 1,
            "score": 0,
            "created_at": datetime.utcnow(),
            "last_updated": datetime.utcnow()
        }
        
        result = await reports_collection.insert_one(report_doc)
        print(f"Insertion successful: {result.inserted_id}")
        
        return {
            "report_id": str(result.inserted_id),
            "detected_issue": analysis["issue_type"],
            "description": final_description,
            "severity": analysis["severity"],
            "image_url": monarch_url,
            "merged": False
        }



    except Exception as e:
        import traceback
        print("-" * 50)
        print(f"CRITICAL ERROR in create_report: {e}")
        traceback.print_exc()
        print("-" * 50)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error: {str(e)}"
        )


@router.post("/vote")
async def vote_report(vote: VoteRequest):
    try:
        # 1. Upsert vote
        await votes_collection.update_one(
            {"user_id": vote.user_id, "report_id": vote.report_id},
            {"$set": {"vote_type": vote.vote_type}},
            upsert=True
        )
        
        # 2. Recalculate score
        pipeline = [
            {"$match": {"report_id": vote.report_id}},
            {"$group": {"_id": "$report_id", "total_score": {"$sum": "$vote_type"}}}
        ]
        
        cursor = votes_collection.aggregate(pipeline)
        result = await cursor.to_list(length=1)
        
        new_score = result[0]["total_score"] if result else 0
        
        # 3. Update report with new score
        await reports_collection.update_one(
            {"_id": ObjectId(vote.report_id)},
            {"$set": {"score": new_score}}
        )
        
        return {"report_id": vote.report_id, "new_score": new_score}
        
    except Exception as e:
        print(f"Voting Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/feed")
async def get_feed(report_status: str = None, issue_type: str = None):
    try:
        query = {}
        if report_status:
            query["status"] = report_status
        if issue_type:
            query["issue_type"] = issue_type
            
        cursor = reports_collection.find(query).sort("last_updated", -1)

        reports = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            reports.append(doc)
            
        return reports
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/{report_id}")
async def get_report(report_id: str):
    try:
        report = await reports_collection.find_one({"_id": ObjectId(report_id)})
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        report["_id"] = str(report["_id"])
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class StatusUpdate(BaseModel):
    status: str

@router.patch("/{report_id}/status")
async def update_report_status(report_id: str, update: StatusUpdate):
    try:
        valid_statuses = ["Open", "In Progress", "Resolved", "Closed"]
        if update.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
            
        result = await reports_collection.update_one(
            {"_id": ObjectId(report_id)},
            {"$set": {"status": update.status, "last_updated": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Report not found")
            
        return {"message": "Status updated", "status": update.status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

