/* eslint-disable react-hooks/exhaustive-deps */
import { FaceMutationType } from '@/types/face';
import { base64ToFile } from '@/utils/file';
import { makeToast } from '@/utils/toast';
import { router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertTriangle, CameraIcon, LoaderCircle, SaveIcon, XCircleIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export function RegisterFaceDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    //NEW
    const [message, setMessage] = useState<null | string>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

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
                        setMessage(null);
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
        } else {
            stopAnything();
        }
    }, [open]);

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
    };

    useEffect(() => {
        if (!open) {
            setMessage('Initializing...');
            setCapturedImage(null);
        }
    }, [open]);

    const capture = () => {
        if (videoRef.current) {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/jpeg');
            setCapturedImage(imageData);

            const file = base64ToFile(imageData, 'photo.jpg');

            setData('image', file);
            stopAnything();
        }
    };

    const {
        setData,
        post,
        processing: processing,
    } = useForm<FaceMutationType>({
        image: '',
    });

    const submitIn = () => {
        post(route('facial-photo.store'), {
            onSuccess: () => {
                router.visit(route('facial-photo.index'), {
                    only: ['face'], // limit refetching only to necessary props
                    preserveScroll: true,
                });
            },
            onFinish: () => {
                setOpen(false);
                makeToast({ success: true, message: 'Success register face' });
            },
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="sm:max-w-5xl">
                <AlertDialogHeader className="text-center">
                    <AlertDialogTitle className="text-2xl">Register Face</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                        Please register your face before use attendance system.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="grid grid-cols-1 items-start gap-4 px-2 md:grid-cols-2 md:px-0">
                    {/* === Left: Camera preview === */}
                    <div className="flex w-full flex-col gap-2">
                        <Card className={`border-muted relative w-full border !p-1 transition-colors duration-300`}>
                            <CardContent className="relative p-0">
                                {capturedImage ? (
                                    <img src={capturedImage} />
                                ) : (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        className="h-72 w-full rounded-lg object-cover"
                                        // style={{ transform: 'scaleX(-1)' }}
                                    />
                                )}

                                {/* Overlay: Challenge badge at bottom */}
                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute bottom-2 left-1/2 w-[90%] -translate-x-1/2 rounded-md bg-black/60 px-4 py-2 text-white backdrop-blur"
                                    >
                                        <p className="mt-1 text-center text-xs text-white">{message}</p>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                        <Button size="sm" disabled={!!message} onClick={() => (!message ? capture() : null)}>
                            <CameraIcon className="h-4 w-4" />
                            Capture
                        </Button>
                    </div>

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

                        <Button className="w-full sm:w-auto" onClick={() => submitIn()} disabled={processing || !capturedImage}>
                            {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
                            Save
                        </Button>
                    </div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
