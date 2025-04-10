export type FaceType = {
    id: string;
    user_id: string | null;
    face_encoding: string | null;
    photo: string | null;
};

export type FaceMutationType = {
    image: File | string;
};
