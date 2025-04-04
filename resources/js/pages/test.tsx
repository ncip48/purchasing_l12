import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, MicOff, MoveUp } from 'lucide-react';
import { JSX, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const challengeMap: Record<string, { text: string; icon: JSX.Element }> = {
    nod: { text: 'Nod 3 times', icon: <MoveUp className="text-primary h-6 w-6" /> },
    mouth_open: { text: 'Open your mouth', icon: <MicOff className="text-destructive h-6 w-6" /> },
    blink: { text: 'Blink your eyes', icon: <Eye className="h-6 w-6 text-yellow-500" /> },
};

function LivenessCheck() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [message, setMessage] = useState('Initializing...');
    const [actionDetected, setActionDetected] = useState(false);
    const [faceDetected, setFaceDetected] = useState(true);
    const [faceMatch, setFaceMatch] = useState(true);
    const [challenge, setChallenge] = useState<{ text: string; icon: JSX.Element } | null>(null);

    useEffect(() => {
        wsRef.current = new WebSocket('ws://localhost:8080/ws/liveness');

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received data:', data);
            setFaceDetected(data.face_detected);
            setFaceMatch(data.face_match);
            setChallenge(
                challengeMap[data.challenge] || { text: 'Unknown challenge', icon: <AlertCircle className="text-muted-foreground h-6 w-6" /> },
            );
            setActionDetected(data.action_detected || false);
            setMessage(data.action_detected ? 'Action detected!' : 'Please follow the instruction.');
        };

        return () => wsRef.current?.close();
    }, []);

    const sendFrame = (frame: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(frame);
        }
    };

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                setInterval(() => {
                    if (videoRef.current && ctx) {
                        const video = videoRef.current;
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                        const imageData = canvas.toDataURL('image/jpeg').split(',')[1];
                        sendFrame(imageData);
                    }
                }, 500);
            } catch (error) {
                console.error('Camera access error:', error);
                setMessage('Camera access denied');
            }
        };

        startCamera();
    }, []);

    useEffect(() => {
        if (actionDetected) {
            toast.success('Verification successful');
        }
    }, [actionDetected]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
            <h2 className="text-2xl font-bold">Liveness Check</h2>
            <Card
                className={`relative w-80 border ${faceDetected && faceMatch && !actionDetected ? 'border-muted' : actionDetected ? 'border-warning' : 'border-destructive'}`}
            >
                <CardContent className="p-0">
                    <video ref={videoRef} autoPlay className="h-64 w-full rounded-md" style={{ transform: 'scaleX(-1)' }} />
                    {!faceDetected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-lg font-bold text-white">
                            Face not detected
                        </div>
                    )}
                    {!faceMatch && faceDetected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-lg font-bold text-white">
                            Face not match
                        </div>
                    )}
                </CardContent>
            </Card>
            <motion.div key={challenge?.text} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                {challenge?.icon}
                <Badge>{challenge?.text ?? 'Waiting for challenge...'}</Badge>
            </motion.div>

            <p className="text-muted-foreground">{message}</p>
        </div>
    );
}

export default LivenessCheck;
