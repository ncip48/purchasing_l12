from deepface import DeepFace

def detect_emotion(frame, emotion):
    result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)

    # Get dominant emotion
    dominant_emotion = result[0]['dominant_emotion']
    
    print(f'{dominant_emotion}, {emotion}')
    
    if dominant_emotion == emotion:
        return True