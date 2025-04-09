import math
import time
import cv2
import cvzone
from ultralytics import YOLO

confidence = 0.6

cap = cv2.VideoCapture(0)  # Ganti ke 0 untuk webcam default
cap.set(3, 640)
cap.set(4, 480)

model = YOLO("./api/modules/models/l_version_1_300.pt")
classNames = ["fake", "real"]

prev_frame_time = 0

while True:
    new_frame_time = time.time()
    success, img = cap.read()

    if not success or img is None:
        print("Gagal mendapatkan frame dari kamera.")
        continue

    results = model(img, stream=True, verbose=False)
    for r in results:
        boxes = r.boxes
        for box in boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            w, h = x2 - x1, y2 - y1
            conf = round(float(box.conf[0]), 2)
            cls = int(box.cls[0])
            if conf > confidence:
                color = (0, 255, 0) if classNames[cls] == 'real' else (0, 0, 255)
                cvzone.cornerRect(img, (x1, y1, w, h), colorC=color, colorR=color)
                cvzone.putTextRect(img, f'{classNames[cls].upper()} {int(conf * 100)}%',
                                   (max(0, x1), max(35, y1)), scale=2, thickness=4,
                                   colorR=color, colorB=color)

    fps = 1 / (new_frame_time - prev_frame_time)
    prev_frame_time = new_frame_time
    print(f"FPS: {fps:.2f}")

    cv2.imshow("Image", img)
    if cv2.waitKey(1) == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
