from fastapi import FastAPI, WebSocket, APIRouter, Depends, File, UploadFile, HTTPException
import cv2
import numpy as np
import mediapipe as mp
import random
from operator import attrgetter
from database import get_db
from auth import get_current_user
from sqlalchemy.orm import Session
from face import encode_face
from utils import uuid_to_bin
from uuid import UUID, uuid4
from models import Face
import os
from utils import send_error, decode_frame, is_low_light, resize_to_square, match_face, get_landmarks, detect_challenge_action
from modules.spoof import detect_spoofing

# FastAPI app
app = FastAPI()
router = APIRouter()

UPLOAD_DIR = "./public/img"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Load MediaPipe FaceMesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True)

@app.websocket("/ws/liveness")
async def liveness_websocket(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()

    user_id = websocket.query_params.get("user_id")
    if not user_id:
        await send_error(websocket, "Missing user_id")
        return

    face = db.query(Face).filter(Face.user_id == user_id).first()
    if not face:
        await send_error(websocket, "Face not registered")
        return

    challenge = random.choice(["blink", "mouth_open", "happy", "surprise"])

    try:
        while True:
            data = await websocket.receive_text()
            frame = decode_frame(data)

            # Step 2: Check low light
            if is_low_light(frame):
                await send_error(websocket, "Low light condition")
                continue

            # Step 3: Detect face landmarks
            frame = resize_to_square(frame)
            results = face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            if not results.multi_face_landmarks:
                await send_error(websocket, "No face detected")
                continue

            # Step 4: Match face
            if not match_face(frame, face):
                await send_error(websocket, "Face does not match")
                continue
            
            spoofing = detect_spoofing(frame)

            if spoofing:
                print("Liveness:", spoofing["label"])
            else:
                print("No face or not confident enough")

            # Step 5: Perform challenge
            landmarks = get_landmarks(results)
            action_detected = bool(detect_challenge_action(challenge, frame, landmarks))

            await websocket.send_json({
                "error": None,
                "challenge": challenge,
                "action_detected": action_detected
            })

            if action_detected:
                break

    except Exception as e:
        print(f"WebSocket Error: {e}")
        await send_error(websocket, "Internal server error")
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
