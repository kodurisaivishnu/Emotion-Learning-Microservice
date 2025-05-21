from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from deepface import DeepFace
import shutil
import os
import uuid

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/detect-emotion")
async def detect_emotion(file: UploadFile = File(...)):
    filename = f"{uuid.uuid4()}.jpg"

    # Save file temporarily
    with open(filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = DeepFace.analyze(img_path=filename, actions=["emotion"], enforce_detection=False)
        emotion = result[0]["dominant_emotion"]
        return JSONResponse(content={"emotion": emotion})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    finally:
        os.remove(filename)
