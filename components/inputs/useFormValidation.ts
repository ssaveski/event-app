import { useRef, useCallback } from 'react';
import { InputRef } from './Input';

export const useFormValidation = () => {
    const inputRefs = useRef<{ [key: string]: InputRef }>({});

    const register = useCallback((name: string, ref: InputRef) => {
        inputRefs.current[name] = ref;
    }, []);

    const isFormValid = useCallback(() => {
        let isValid = true;
        Object.values(inputRefs.current).forEach((input) => {
            if (!input.validate()) {
                isValid = false;
            }
        });
        return isValid;
    }, []);

    return { register, isFormValid };
};