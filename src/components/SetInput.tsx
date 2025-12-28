import { TextInput, TextInputProps } from 'react-native';
import { useState, useEffect } from 'react';

interface Props extends TextInputProps {
    initialValue: string;
    onCommit: (value: string) => void;
    allowDecimals?: boolean;
}

export default function SetInput({ initialValue, onCommit, allowDecimals = false, ...props }: Props) {
    const [text, setText] = useState(initialValue);

    // Sync with prop updates (e.g. from DB refresh), but only if not focused? 
    // actually, if initialValue changes, we should update.
    useEffect(() => {
        setText(initialValue);
    }, [initialValue]);

    const handleChangeText = (t: string) => {
        let clean = t;
        if (allowDecimals) {
            // Allow numbers and dots
            clean = clean.replace(/[^0-9.]/g, '');

            // Prevent multiple dots: keep only the first one
            const parts = clean.split('.');
            if (parts.length > 2) {
                clean = parts[0] + '.' + parts.slice(1).join('');
            }
        } else {
            // Integer only
            clean = clean.replace(/[^0-9]/g, '');
        }

        setText(clean);
    };

    const handleBlur = () => {
        onCommit(text);
        props.onBlur?.(undefined as any); // Delegate if needed
    };

    return (
        <TextInput
            {...props}
            value={text}
            onChangeText={handleChangeText}
            onBlur={handleBlur}
            keyboardType="numeric" // Helps, but sanitization enforces
        />
    );
}
