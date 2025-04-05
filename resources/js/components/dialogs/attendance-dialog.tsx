/* eslint-disable react-hooks/exhaustive-deps */
import { AttendanceMutationType } from '@/types/attendance';
import { makeToast } from '@/utils/toast';
import { router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, CameraOff, CheckCircle, Eye, LoaderCircle, MicOff, MoveUp } from 'lucide-react';
import { JSX, useEffect, useRef, useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const challengeMap: Record<string, { text: string; icon: JSX.Element }> = {
    nod: { text: 'Nod 3 times', icon: <MoveUp className="text-primary h-6 w-6" /> },
    mouth_open: { text: 'Open your mouth', icon: <MicOff className="text-destructive h-6 w-6" /> },
    blink: { text: 'Blink your eyes', icon: <Eye className="h-6 w-6 text-yellow-500" /> },
};

export function AttendanceDialog({
    open,
    setOpen,
    attendance,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    attendance: { in: null | string; out: null | string };
}) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [message, setMessage] = useState('Initializing...');
    const [actionDetected, setActionDetected] = useState(false);
    const [faceDetected, setFaceDetected] = useState(true);
    const [faceMatch, setFaceMatch] = useState(false);
    const [challenge, setChallenge] = useState<{ text: string; icon: JSX.Element } | null>(null);
    const [isDone, setIsDone] = useState(false);

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
            stopAnything();
        }
    }, [open]);

    useEffect(() => {
        if (open && actionDetected) {
            makeToast({ success: true, message: 'Verification successfull' });
            stopAnything();
            setIsDone(true);
        }
    }, [actionDetected, open]);

    const stopAnything = () => {
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
    };

    useEffect(() => {
        if (!open) {
            setActionDetected(false);
            setMessage('Initializing...');
            setFaceDetected(false);
            setFaceMatch(false);
            setChallenge(null);
            setIsDone(false);
        }
    }, [open]);

    const getLocation = (): Promise<{ latitude: string; longitude: string }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                return reject('Geolocation not supported');
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude.toString(),
                        longitude: position.coords.longitude.toString(),
                    });
                },
                () => {
                    reject('Unable to retrieve location');
                },
            );
        });
    };

    useEffect(() => {
        const fetchLocation = async () => {
            if (open) {
                try {
                    const { latitude, longitude } = await getLocation();
                    setData('latitude', latitude);
                    setData('longitude', longitude);
                    setDataOut('latitude', latitude);
                    setDataOut('longitude', longitude);
                } catch (error) {
                    console.log(error);
                    makeToast({ success: false, message: 'Failed to get location' });
                }
            }
        };

        fetchLocation();
    }, [open]);

    const {
        setData,
        post: postIn,
        processing: processingIn,
    } = useForm<AttendanceMutationType>({
        photo: 'no',
        latitude: '',
        longitude: '',
        type: 'IN',
    });

    const submitIn = () => {
        postIn(route('attendance-daily.store'), {
            onFinish: () => {
                setOpen(false);
                makeToast({ success: true, message: 'Success attend in' });
            },
        });
    };

    const {
        setData: setDataOut,
        post: postOut,
        processing: processingOut,
    } = useForm<AttendanceMutationType>({
        photo: 'no',
        latitude: '',
        longitude: '',
        type: 'OUT',
    });

    const submitOut = () => {
        postOut(route('attendance-daily.store'), {
            onSuccess: () => {
                router.visit(route('attendance-daily.index'), {
                    only: ['attendanceIn', 'attendanceOut', 'items'], // limit refetching only to necessary props
                    preserveScroll: true,
                });
            },
            onFinish: () => {
                setOpen(false);
                makeToast({ success: true, message: 'Success attend out' });
            },
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="sm:max-w-[500px]">
                <AlertDialogHeader className="text-center">
                    <AlertDialogTitle className="text-2xl">Face Attendance</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                        Please face the camera and follow the challenge below.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex flex-col items-center gap-4 px-4 py-2">
                    {/* Video feed card */}
                    <Card
                        className={`relative w-full max-w-xs border transition-colors duration-300 ${
                            faceDetected && faceMatch && !actionDetected && challenge
                                ? 'border-muted'
                                : actionDetected
                                  ? 'border-green-500'
                                  : 'border-red-500'
                        }`}
                    >
                        <CardContent className="p-0">
                            <video ref={videoRef} autoPlay className="h-64 w-full rounded-md object-cover" style={{ transform: 'scaleX(-1)' }} />
                            {!challenge && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60">
                                    <CameraOff className="h-10 w-10 text-red-500" />
                                </div>
                            )}
                            {!faceDetected && challenge && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 text-sm font-bold text-white">
                                    Face not detected
                                </div>
                            )}
                            {faceDetected && !faceMatch && challenge && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 text-sm font-bold text-white">
                                    Face not matched
                                </div>
                            )}
                            {isDone && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/80">
                                    <CheckCircle className="h-10 w-10 text-green-500" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Challenge display */}
                    <motion.div
                        key={challenge?.text}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-2"
                    >
                        {challenge?.icon}
                        <Badge variant="outline">{challenge?.text ?? 'Waiting for challenge...'}</Badge>
                    </motion.div>

                    {/* Message */}
                    <p className="text-muted-foreground text-center text-sm">{message}</p>
                </div>

                {/* Footer with actions */}
                <AlertDialogFooter className="flex flex-col gap-2">
                    <div className="flex w-full items-center justify-between gap-2">
                        <Button variant="destructive" className="flex-1" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>

                        <Button className="flex-1" onClick={() => submitIn()} disabled={!actionDetected || processingIn || !!attendance.in}>
                            {processingIn ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Clock In
                        </Button>

                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => submitOut()}
                            disabled={!actionDetected || processingOut || !attendance.in || !!attendance.out}
                        >
                            {processingOut ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Clock Out
                        </Button>
                    </div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
