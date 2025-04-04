import cv2
import face_recognition
import numpy as np
import face_recognition
import io

def encode_face(image_bytes: bytes):
    # Wrap bytes in a BytesIO stream so face_recognition can read it like a file
    image_stream = io.BytesIO(image_bytes)
    image = face_recognition.load_image_file(image_stream)
    encoding = face_recognition.face_encodings(image)

    if encoding:
        return encoding[0]

    return None

def recognize_face(image_path, known_face_encodings):
    unknown_image = face_recognition.load_image_file(image_path)
    unknown_encoding = face_recognition.face_encodings(unknown_image)

    if unknown_encoding:
        unknown_encoding = unknown_encoding[0]
        for known_encoding in known_face_encodings:
            results = face_recognition.compare_faces([known_encoding], unknown_encoding)
            if results[0]:
                return True  # Face recognized
    return False