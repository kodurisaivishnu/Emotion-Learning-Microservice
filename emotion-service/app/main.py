from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from deepface import DeepFace
import shutil
import os
import uuid

app = FastAPI()

# Enable CORS so your frontend can access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/detect-emotion")
async def detect_emotion(file: UploadFile = File(...)):
    filename = f"{uuid.uuid4()}.jpg"

    # Save uploaded file temporarily
    with open(filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Perform emotion analysis
        result = DeepFace.analyze(img_path=filename, actions=["emotion"])
        emotion = result[0]["dominant_emotion"]
    except Exception as e:
        return JSONResponse(content={"error": str(e)})
    finally:
        # Delete the temporary file
        os.remove(filename)

    return JSONResponse(content={"emotion": emotion})
