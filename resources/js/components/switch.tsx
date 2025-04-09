import { forwardRef } from 'react';
import InputError from './input-error';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

interface SwitchInputProps {
    title: string;
    name: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    error?: string;
}

const SwitchInput = forwardRef<HTMLButtonElement, SwitchInputProps>(({ title, name, checked, onCheckedChange, error }, ref) => {
    return (
        <div>
            <div className="flex items-center space-x-2">
                <Switch id={name} ref={ref} defaultChecked={checked} onCheckedChange={onCheckedChange} />
                <Label htmlFor={name}>{title}</Label>
            </div>
            {error && <InputError className="mt-1" message={error} />}
        </div>
    );
});

SwitchInput.displayName = 'SwitchInput';

export default SwitchInput;
