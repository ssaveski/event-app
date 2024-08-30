import { isAfter } from 'date-fns';

export interface ValidationRule {
    validate: (value: any) => boolean;
    message: string;
}

export type ValidationRules = ValidationRule[];

export const isMin = (value: number,  min: number) => Number(value) >= min;


export const isRequired = (value: any) => !!value;

export const isDateAfter = (startDate: Date, endDate: Date) => {
    return isAfter(endDate, startDate);
};

export const isEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
};