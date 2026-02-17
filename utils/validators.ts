// utils/validators.ts
import {OutcomeProps} from "@/utils/util";

// Airline letters + exactly 4 digits (AA1234)
export const flightRegex = /\b[A-Za-z]{2,}\d{4}\b/g;

// Terminal-Gate pattern (T1-G1, T7-G3)
export const gateRegex = /\bT\d+-G\d+\b/g;

export const validateTicketNumber = (ticket: string): boolean =>
    /^\d{10}$/.test(ticket);

export const validateIdentification = (id: string): boolean =>
    /^\d{6}$/.test(id);

export const validatePhone = (phone: string): boolean =>
    /^[1-9]\d{9}$/.test(phone);

export const validateEmail = (email: string): boolean =>
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

export const validateName = (name: string): boolean =>
    /^[A-Za-z]{2,}$/.test(name);

export const validatePassword = (password: string): boolean =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);

// Helper function to set outcome
export const setOutcomeHelper = (status: 'error' | 'success', message: string, setOutcome: React.Dispatch<React.SetStateAction<OutcomeProps | undefined>>) => {
    setOutcome({
        status,
        message,
    });
};

// Input: AA1234 => Output: "1234"
export const stripAlphabets=(input: string, position?: number) => {
    const match = input.match(/^[A-Z]+/i); // matches leading letters
    return match ? match[position ?? 0] : '';
}

// ensureAbbreviation("British Airways")
// → "BA - British Airways"
export const ensureAbbreviation = (value: string): string => {
    const regex = /^[A-Z]{2,}\s*-\s*.+$/;

    // If already formatted correctly, return as-is
    if (regex.test(value.trim())) {
        return value.trim();
    }

    // Otherwise generate abbreviation
    const name = value.trim();

    // Take first letter of each word
    const abbreviation = name
        .split(/\s+/)
        .map(word => word[0]?.toUpperCase())
        .join('');

    return `${abbreviation} - ${name}`;
}


/*export const formatTime = (isoTimestamp: string): string => {
    const date = new Date(isoTimestamp);
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};*/

export const formatTime = (value: string)=>  {
    const date = new Date(value);

    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}



