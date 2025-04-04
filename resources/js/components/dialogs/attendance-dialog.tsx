import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { makeToast } from '@/utils/toast';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, MicOff, MoveUp } from 'lucide-react';
import { JSX, useEffect, useRef, useState } from 'react';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';

const challengeMap: Record<string, { text: string; icon: JSX.Element }> = {
    nod: { text: 'Nod 3 times', icon: <MoveUp className="text-primary h-6 w-6" /> },
    mouth_open: { text: 'Open your mouth', icon: <MicOff className="text-destructive h-6 w-6" /> },
    blink: { text: 'Blink your eyes', icon: <Eye className="h-6 w-6 text-yellow-500" /> },
};

export function AttendanceDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [message, setMessage] = useState('Initializing...');
    const [actionDetected, setActionDetected] = useState(false);
    const [faceDetected, setFaceDetected] = useState(true);
    const [faceMatch, setFaceMatch] = useState(false);
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
    }, [open]);

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

                const interval = setInterval(() => {
                    if (videoRef.current && ctx) {
                        const video = videoRef.current;
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                        const imageData = canvas.toDataURL('image/jpeg').split(',')[1];
                        sendFrame(imageData);
                    }
                }, 500);

                if (videoRef.current) {
                    videoRef.current.dataset.intervalId = interval.toString(); // Store interval ID
                }
            } catch (error) {
                console.error('Camera access error:', error);
                setMessage('Camera access denied');
            }
        };

        if (open) {
            startCamera();

            // Reinitialize WebSocket when dialog opens
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
        } else {
            // Stop the camera
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach((track) => track.stop()); // Stop all tracks
                videoRef.current.srcObject = null;
            }

            // Clear the interval if it exists
            if (videoRef.current?.dataset.intervalId) {
                clearInterval(Number(videoRef.current.dataset.intervalId));
            }

            // Close the WebSocket connection
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        }
    }, [open]);

    useEffect(() => {
        if (open && actionDetected) {
            makeToast({ success: true, message: 'Verification successfull' });
        }
    }, [actionDetected, open]);

    useEffect(() => {
        if (!open) {
            setActionDetected(false);
            setMessage('Initializing...');
            setFaceDetected(false);
            setFaceMatch(false);
            setChallenge(null);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Attendance</DialogTitle>
                    <DialogDescription>Scan your face to mark your attendance.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center gap-6 p-6">
                    <Card
                        className={`relative w-80 border ${faceDetected && faceMatch && !actionDetected ? 'border-muted' : actionDetected ? 'border-warning' : 'border-destructive'}`}
                    >
                        <CardContent className="p-0">
                            <video ref={videoRef} autoPlay className="h-64 w-full rounded-md" style={{ transform: 'scaleX(-1)' }} />
                            {!faceDetected && !actionDetected && challenge && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 text-lg font-bold text-white">
                                    Face not detected
                                </div>
                            )}
                            {!faceMatch && faceDetected && !actionDetected && challenge && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 text-lg font-bold text-white">
                                    Face not match
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <motion.div
                        key={challenge?.text}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2"
                    >
                        {challenge?.icon}
                        <Badge>{challenge?.text ?? 'Waiting for challenge...'}</Badge>
                    </motion.div>
                    <p className="text-muted-foreground">{message}</p>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={() => setOpen(false)} disabled={!actionDetected}>
                        Clock-In
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
