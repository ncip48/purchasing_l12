import cv2
import numpy as np
import torch
import torchvision.transforms as transforms
from mini_fastnet import MiniFASNetV2
import os

MODEL_PATH = "./api/modules/models/2.7_80x80_MiniFASNetV2.pth"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
SPOOF_THRESHOLD = 0.5

# === Load the real model ===
def load_model():
    model = MiniFASNetV2(num_classes=2, img_size=80).to(DEVICE)
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model.eval()
    return model

transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize((80, 80)),
    transforms.ToTensor(),
    transforms.Normalize([0.5]*3, [0.5]*3)
])

def predict(model, frame, bbox):
    x, y, w, h = bbox
    face = frame[y:y+h, x:x+w]
    if face.size == 0:
        return 1.0
    face = transform(face).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        output = model(face)
        prob = torch.softmax(output, dim=1)
        return prob[0][1].item()  # spoof score

def run_live_detection():
    model = load_model()
    cap = cv2.VideoCapture(0)
    face_detector = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_detector.detectMultiScale(gray, 1.3, 5)

        for (x, y, w, h) in faces:
            try:
                score = predict(model, frame, (x, y, w, h))
                label = "Fake" if score > SPOOF_THRESHOLD else "Real"
                color = (0, 0, 255) if label == "Fake" else (0, 255, 0)
                cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
                cv2.putText(frame, f"{label} ({score:.2f})", (x, y - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
            except Exception as e:
                print("[WARN]", str(e))

        cv2.imshow("Anti-Spoofing (PyTorch)", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    if not os.path.exists(MODEL_PATH):
        print(f"Model not found: {MODEL_PATH}")
    else:
        run_live_detection()
