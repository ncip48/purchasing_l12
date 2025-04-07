/* eslint-disable react-hooks/exhaustive-deps */
import { SharedData } from '@/types';
import { AttendanceMutationType } from '@/types/attendance';
import { base64ToFile } from '@/utils/file';
import { makeToast } from '@/utils/toast';
import { router, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    CameraOff,
    CheckCircle,
    Clock4Icon,
    Clock8Icon,
    Eye,
    LoaderCircle,
    MicOff,
    MoveUp,
    Smile,
    XCircleIcon,
    Zap,
} from 'lucide-react';
import { JSX, useEffect, useRef, useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const challengeMap: Record<string, { text: string; icon: JSX.Element }> = {
    nod: { text: 'Nod 3 times', icon: <MoveUp className="text-primary h-6 w-6" /> },
    mouth_open: { text: 'Open your mouth', icon: <MicOff className="h-6 w-6 text-lime-500" /> },
    blink: { text: 'Blink your eyes', icon: <Eye className="h-6 w-6 text-yellow-500" /> },
    happy: { text: 'Show a happy face', icon: <Smile className="h-6 w-6 text-green-500" /> },
    surprise: { text: 'Show a surprised face', icon: <Zap className="h-6 w-6 text-blue-500" /> },
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
    const { auth } = usePage<SharedData>().props;

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [message, setMessage] = useState<string | null>('Initializing...');
    const [actionDetected, setActionDetected] = useState(false);
    const [faceDetected, setFaceDetected] = useState(true);
    const [faceMatch, setFaceMatch] = useState(false);
    const [challenge, setChallenge] = useState<{ text: string; icon: JSX.Element } | null>(null);
    const [isDone, setIsDone] = useState(false);
    const [faceRegistered, setFaceRegistered] = useState(false);
    const [lowLight, setLowLight] = useState(false);
    const [capturedFrame, setCapturedFrame] = useState<string | null>(null);

    const WS_URL = `ws://localhost:8080/ws/liveness?user_id=${auth.user.id}`;

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
            wsRef.current = new WebSocket(WS_URL);

            wsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('Received data:', data);
                setFaceDetected(data.face_detected);
                setFaceMatch(data.face_match);
                setChallenge(
                    challengeMap[data.challenge] || { text: 'Unknown challenge', icon: <AlertCircle className="text-muted-foreground h-6 w-6" /> },
                );
                setActionDetected(data.action_detected || false);
                setMessage(null);
                setFaceRegistered(data.is_face_registered);
                setLowLight(data.is_low_light);
            };
        } else {
            stopAnything();
        }
    }, [open]);

    useEffect(() => {
        if (open && actionDetected && videoRef.current) {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/jpeg');
            setCapturedFrame(imageData);

            makeToast({ success: true, message: 'Verification successful' });
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
            setFaceRegistered(false);
            setLowLight(false);
            setCapturedFrame(null);
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

    useEffect(() => {
        if (open && capturedFrame) {
            const file = base64ToFile(capturedFrame, 'photo.jpg');

            setData('photo', file);
            setDataOut('photo', file);
        }
    }, [open, capturedFrame]);

    const {
        setData,
        post: postIn,
        processing: processingIn,
    } = useForm<AttendanceMutationType>({
        photo: '',
        latitude: '',
        longitude: '',
        type: 'IN',
    });

    const submitIn = () => {
        postIn(route('attendance-daily.store'), {
            onSuccess: () => {
                router.visit(route('attendance-daily.index'), {
                    only: ['attendanceIn', 'attendanceOut', 'items'], // limit refetching only to necessary props
                    preserveScroll: true,
                });
            },
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
        photo: '',
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
            <AlertDialogContent className="sm:max-w-5xl">
                <AlertDialogHeader className="text-center">
                    <AlertDialogTitle className="text-2xl">Face Attendance</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                        Please face the camera and follow the instructions to mark your attendance.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {/* === Status Message === */}
                {attendance.in && attendance.out && (
                    <div className="border-muted bg-muted text-muted-foreground rounded-md border p-4 text-sm">
                        <ul className="list-inside list-disc space-y-1">
                            {attendance.in && (
                                <li>
                                    You have <span className="text-primary font-medium">clocked in</span> at{' '}
                                    <span className="font-semibold">{new Date(attendance.in).toLocaleTimeString()}</span>.
                                </li>
                            )}
                            {attendance.out && (
                                <li>
                                    You have <span className="text-primary font-medium">clocked out</span> at{' '}
                                    <span className="font-semibold">{new Date(attendance.out).toLocaleTimeString()}</span>.
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                <div className="grid grid-cols-1 items-start gap-4 px-2 md:grid-cols-2 md:px-0">
                    {/* === Left: Camera preview === */}
                    <Card
                        className={`relative w-full border !p-1 transition-colors duration-300 ${
                            faceDetected && faceMatch && !actionDetected && challenge
                                ? 'border-muted'
                                : actionDetected
                                  ? 'border-green-500'
                                  : 'border-red-500'
                        }`}
                    >
                        <CardContent className="relative p-0">
                            <video ref={videoRef} autoPlay className="h-72 w-full rounded-lg object-cover" style={{ transform: 'scaleX(-1)' }} />

                            {/* Overlay: Camera off */}
                            {!challenge && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60">
                                    <CameraOff className="h-10 w-10 text-red-500" />
                                </div>
                            )}

                            {!faceDetected && challenge && !isDone && !faceRegistered && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/80 text-sm font-bold text-white">
                                    You must register your face first
                                </div>
                            )}

                            {!faceDetected && challenge && !isDone && faceRegistered && lowLight && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/80 text-sm font-bold text-white">
                                    Low light condition detected. Please ensure proper lighting.
                                </div>
                            )}

                            {/* Overlay: Face not detected */}
                            {!faceDetected && challenge && !isDone && faceRegistered && !lowLight && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 text-sm font-bold text-white">
                                    Face not detected
                                </div>
                            )}

                            {/* Overlay: Face not matched */}
                            {faceDetected && !faceMatch && challenge && !isDone && faceRegistered && !lowLight && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 text-sm font-bold text-white">
                                    Face not matched
                                </div>
                            )}

                            {/* Overlay: Done */}
                            {isDone && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/70">
                                    <CheckCircle className="h-10 w-10 text-green-500" />
                                </div>
                            )}

                            {/* Overlay: Challenge badge at bottom */}
                            {(challenge?.text || message) && faceRegistered && (
                                <motion.div
                                    key={challenge?.text}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute bottom-2 left-1/2 w-[90%] -translate-x-1/2 rounded-md bg-black/60 px-4 py-2 text-white backdrop-blur"
                                >
                                    {challenge?.text && !isDone && (
                                        <div className="flex items-center justify-center gap-2 text-sm">
                                            {challenge.icon}
                                            <span>{challenge.text}</span>
                                        </div>
                                    )}
                                    {message && <p className="mt-1 text-center text-xs text-white">{message}</p>}
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>

                    {/* === Right: Attention / Instructions === */}
                    <div className="bg-muted hidden rounded-lg border p-5 shadow-sm md:block">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                            <AlertTriangle className="text-yellow-500" size={20} />
                            Attention
                        </h3>
                        <ul className="text-muted-foreground list-inside list-disc space-y-2 text-sm">
                            <li>Make sure your face is facing the camera.</li>
                            <li>Take off your mask, glasses, and other face coverings.</li>
                            <li>Position yourself in good lighting conditions.</li>
                            <li>Ensure the face detected is the current logged-in user.</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <AlertDialogFooter className="mt-2 flex flex-col gap-2">
                    <div className="flex w-full flex-col items-center justify-end gap-2 sm:flex-row">
                        <Button variant="destructive" className="w-full sm:w-auto" onClick={() => setOpen(false)}>
                            <XCircleIcon />
                            Cancel
                        </Button>

                        <Button className="w-full sm:w-auto" onClick={() => submitIn()} disabled={!actionDetected || processingIn || !!attendance.in}>
                            {processingIn ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Clock8Icon className="h-4 w-4" />}
                            Clock In
                        </Button>

                        <Button
                            variant="secondary"
                            className="w-full sm:w-auto"
                            onClick={() => submitOut()}
                            disabled={!actionDetected || processingOut || !attendance.in || !!attendance.out}
                        >
                            {processingOut ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Clock4Icon className="h-4 w-4" />}
                            Clock Out
                        </Button>
                    </div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
