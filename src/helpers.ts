import { AxiosError } from 'axios';

export function now(): number {
    const d = new Date();
    return Math.round(d.getTime() / 1000);
}

export function hasMessage(error: unknown): error is Error {
    return error instanceof Error;
}

export function isAxiosError(error: unknown): error is AxiosError {
    return error instanceof Error && 'isAxiosError' in error;
}
