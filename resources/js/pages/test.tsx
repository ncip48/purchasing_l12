import { motion } from 'framer-motion';
import { AlertCircle, CameraOff, CheckCircle, Eye, MicOff, MoveUp } from 'lucide-react';
import { JSX, useEffect, useRef, useState } from 'react';

const challengeMap: Record<string, { text: string; icon: JSX.Element }> = {
    nod: { text: 'Nod 3 times', icon: <MoveUp className="h-10 w-10 text-blue-400" /> },
    mouth_open: { text: 'Open your mouth', icon: <MicOff className="h-10 w-10 text-red-400" /> },
    blink: { text: 'Blink your eyes', icon: <Eye className="h-10 w-10 text-yellow-400" /> },
};

function LivenessCheck() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [message, setMessage] = useState('Initializing...');
    const [blinkDetected, setBlinkDetected] = useState(false);
    const [challenge, setChallenge] = useState<{ text: string; icon: JSX.Element } | null>(null);

    useEffect(() => {
        wsRef.current = new WebSocket('ws://localhost:8080/ws/liveness');

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received data:', data);

            setChallenge(challengeMap[data.challenge] || { text: 'Unknown challenge', icon: <AlertCircle className="h-10 w-10 text-gray-400" /> });
            setBlinkDetected(data.action_detected || false);
            setMessage(data.action_detected ? 'Action detected!' : 'Please follow the instruction.');
        };

        wsRef.current.onerror = (error) => {
            setMessage('WebSocket error');
            console.error(error);
        };

        return () => {
            wsRef.current?.close();
        };
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

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-900 p-6 text-white">
            <h2 className="mb-4 text-2xl font-bold">Liveness Check</h2>
            <div className="relative h-64 w-80 overflow-hidden rounded-lg border-4 border-gray-700">
                <video ref={videoRef} autoPlay className="h-full w-full" />
                {!challenge && (
                    <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black">
                        <CameraOff className="h-10 w-10 text-red-500" />
                    </div>
                )}
            </div>
            <motion.div
                key={challenge?.text}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-3 rounded-lg bg-gray-800 p-3 text-lg shadow-lg"
            >
                {challenge?.icon}
                {challenge ? `Challenge: ${challenge.text}` : 'Waiting for challenge...'}
            </motion.div>
            <p className="mt-2 text-gray-300">{message}</p>
            {blinkDetected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mt-3 flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 shadow-md"
                >
                    <CheckCircle className="h-6 w-6 text-white" />
                    <span className="font-medium text-white">Liveness verified!</span>
                </motion.div>
            )}
            {!blinkDetected && challenge && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mt-3 flex items-center gap-2 rounded-lg bg-yellow-700 px-4 py-2 shadow-md"
                >
                    <AlertCircle className="h-6 w-6 text-white" />
                    <span className="font-medium text-white">Please follow the challenge.</span>
                </motion.div>
            )}
        </div>
    );
}

export default LivenessCheck;
