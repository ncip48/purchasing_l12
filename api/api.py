from fastapi import FastAPI, WebSocket, APIRouter, Depends, File, UploadFile, HTTPException
import cv2
import numpy as np
import mediapipe as mp
import base64
import random
from operator import attrgetter
from modules.blink import detect_blink
from modules.open_mouth import detect_mouth_open
from modules.nod import detect_nod
from database import get_db
from auth import get_current_user
from sqlalchemy.orm import Session
from face import encode_face
from utils import uuid_to_bin
from uuid import UUID, uuid4
from models import Face
import os
import face_recognition

# FastAPI app
app = FastAPI()
router = APIRouter()

UPLOAD_DIR = "./public/img"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Load MediaPipe FaceMesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)
mp_drawing = mp.solutions.drawing_utils

@app.websocket("/ws/liveness")
async def liveness_websocket(websocket: WebSocket,db: Session = Depends(get_db)):
    await websocket.accept()
    
    challenge = random.choice(["blink", "mouth_open", "nod"])  # Random challenge

    try:
        while True:
            data = await websocket.receive_text()
            frame = cv2.imdecode(np.frombuffer(base64.b64decode(data), np.uint8), cv2.IMREAD_COLOR)
            
            # Resize to square image to avoid MediaPipe warnings
            height, width = frame.shape[:2]
            size = max(height, width)
            frame = cv2.resize(frame, (size, size))

            results = face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

            face_match = False
            face_detected = False
            
            if results.multi_face_landmarks:
                face_detected = True
                face_locations = face_recognition.face_locations(frame)
                face_encodings = face_recognition.face_encodings(frame, face_locations)
                
                user_id = "0195709d-afdc-73aa-9e92-8fb43148264a"
                face = db.query(Face).filter(Face.user_id == user_id).first()
                
                if face:
                    stored_face_encoding = np.frombuffer(face.face_encoding, dtype=np.float64)
                    for face_encoding in face_encodings:
                        match = face_recognition.compare_faces([stored_face_encoding], face_encoding)[0]
                        if match:
                            face_match = True
                
                landmarks = np.array([(lm.x, lm.y, lm.z) for lm in results.multi_face_landmarks[0].landmark])

                if ((challenge == "blink" and detect_blink(landmarks)) or
                        (challenge == "mouth_open" and detect_mouth_open(landmarks)) or
                        (challenge == "nod" and detect_nod(landmarks))):
                    await websocket.send_json({"challenge": challenge, "action_detected": True, "face_detected": True, "face_match": face_match})
                    break  # Challenge completed
                else:
                    await websocket.send_json({"challenge": challenge, "face_detected": True, "face_match": face_match})
            else:
                await websocket.send_json({"challenge": challenge, "face_detected": False, "face_match": False})

    except Exception as e:
        print(f"WebSocket Error: {e}")
    finally:
        await websocket.close()
        
@router.post("/train-face")
async def train_face(
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Read and encode image
    image_data = await image.read()
    encoding = encode_face(image_data)

    if encoding is None:
        raise HTTPException(status_code=400, detail="No face found in the image")

    user_id = current_user["id"]

    # Generate random filename
    file_extension = image.filename.split(".")[-1]
    filename = f"{uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Save image to disk
    with open(file_path, "wb") as f:
        f.write(image_data)

    # Try to find existing face
    face = db.query(Face).filter(Face.user_id == user_id).first()

    if face:
        # Update existing encoding and photo path
        face.face_encoding = np.array(encoding).tobytes()
        face.photo = filename
    else:
        # Create new Face record
        face = Face(
            user_id=user_id,
            face_encoding=np.array(encoding).tobytes(),
            photo=filename
        )
        db.add(face)

    db.commit()

    return {"message": "Face encoding and photo saved successfully", "photo": filename}

app.include_router(router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
