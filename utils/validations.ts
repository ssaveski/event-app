import { isAfter } from 'date-fns';


export interface ValidationRule {
    validate: (value: any) => boolean;
    message: string;
}

export type ValidationRules = ValidationRule[];

export const isNumeric = (value: string) => !isNaN(Number(value)) && isFinite(Number(value));

export const isMin = (min: number) => (value: string) => Number(value) >= min;

export const isMax = (max: number) => (value: string) => Number(value) <= max;

export const isRequired = (value: any) => !!value;

export const isDateAfter = (startDate: Date, endDate: Date) => {
    console.log(startDate, endDate, 'is after');
    return isAfter(endDate, startDate);
};