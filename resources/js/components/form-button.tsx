import { SaveIcon, XCircleIcon } from 'lucide-react';
import LoadingDots from './loading/loading-dots';
import { Button } from './ui/button';

function FormButton({ processing, backUrl }: { processing: boolean; backUrl: string }) {
    const goBack = () => {
        window.location.href = route(backUrl);
    };

    return (
        <div className="flex gap-2">
            <Button type="button" variant="destructive" size="sm" onClick={() => goBack()} className="cursor-pointer">
                <XCircleIcon />
                Cancel
            </Button>
            <Button type="submit" disabled={processing} size="sm" className="cursor-pointer">
                <SaveIcon />
                {processing ? <LoadingDots /> : 'Save'}
            </Button>
        </div>
    );
}

export default FormButton;
