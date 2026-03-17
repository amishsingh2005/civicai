from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routes import auth, reports
from .database import init_db
import os

app = FastAPI(title="CivicAI Backend")

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join("backend", "uploads")
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on startup
@app.on_event("startup")
async def startup_event():
    await init_db()

# Register routes
app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(comments.router)

@app.get("/")
async def root():
    return {"message": "Welcome to CivicAI API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
