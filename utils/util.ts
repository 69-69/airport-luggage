import React from "react";


export type OutcomeProps = {
    status: 'error' | 'success' | 'warning' | undefined;
    message: string;
}

const clearErrorAndSet =
    (
        setter: (v: string) => void,
        setError: React.Dispatch<React.SetStateAction<string | null>>
    ) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setter(e.target.value);
            setError(null);
        };

const clearErrorAndSetString =
    (
        setter: (v: string) => void,
        setError: React.Dispatch<React.SetStateAction<string | null>>
    ) =>
        (value: string) => {
            setter(value);
            setError(null);
        };

const clearOutcomeError =
    (
        setter: (v: string) => void,
        setOutcome: React.Dispatch<React.SetStateAction<OutcomeProps | undefined>>
    ) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setter(e.target.value);

            // Clear only error messages
            setOutcome(prev =>
                prev?.status === 'error' ? undefined : prev
            );
        };

const clearOutcomeErrorString =
    (
        setter: (v: string) => void,
        setOutcome: React.Dispatch<React.SetStateAction<OutcomeProps | undefined>>
    ) =>
        (value: string) => {
            setter(value);

            // Clear only error messages
            setOutcome(prev =>
                prev?.status === 'error' ? undefined : prev
            );
        };

const toCamelCase = (str: string) =>
    str
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .replace(/\s+(.)/g, (_, c) => c.toUpperCase());

const toTitleCase = (text: string): string =>
    text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');


const formatAirline = (text: string): string => {
    return text
        .split('-') // split around the dash
        .map((part, index) => {
            part = part.trim();
            if (index === 0) {
                // First part: assume abbreviation, capitalize all letters
                return part.toUpperCase();
            } else {
                // Second part: capitalize each word
                return part
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
            }
        })
        .join(' - ');
};

// Example:
// console.log(formatFullName("AC - Air Canada")); // "AC - Air Canada"

const toSentenceCase = (text: string): string =>
    text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

const isNumeric = (value: unknown): boolean => {
    if (typeof value === 'number') {
        return !Number.isNaN(value);
    }

    if (typeof value === 'string') {
        return value.trim() !== '' && !Number.isNaN(Number(value));
    }

    return false;
};

const getAirlineAbbreviation = (airlineName: string): string => {
    const words = airlineName.split(' ');
    return words.map(word => word.charAt(0).toUpperCase()).join('');
};

const getAirlineByCode = (code: string): string | undefined => {
    const airline = manualAirlines.find(a => a.startsWith(code + " -"));
    return airline ? airline.split(" - ")[1] : undefined;
}

const manualAirlines: string[] = [
    "AC - Air Canada",
    "AF - Air France",
    "NH - All Nippon Airways",
    "AA - American Airlines",
    "AZ - ITA Airways",
    "BA - British Airways",
    "CX - Cathay Pacific",
    "DL - Delta Air Lines",
    "EK - Emirates",
    "GA - Ghana Airways",
    "IB - Iberia",
    "JL - Japan Airlines",
    "KL - KLM Royal Dutch Airlines",
    "LH - Lufthansa",
    "QR - Qatar Airways",
    "QF - Qantas",
    "SA - South African Airways",
    "SQ - Singapore Airlines",
    "SW - Southwest Airlines",
    "TK - Turkish Airlines",
    "UA - United Airlines"
];

const namePattern = /^[a-zA-Z\s'-]+$/;

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

// generate Gates: G1, G2, etc
const manualGates: string[] = Array.from({length: 100}, (_, i) => `G${i + 1}`);


// generate Gates: T1, T2, etc
const manualTerminals: string[] = Array.from({length: 100}, (_, i) => `T${i + 1}`);

// generate Counters: C1, C2, etc
const manualCounters: string[] = Array.from({length: 100}, (_, i) => `C${i + 1}`);

const statuses: string[] = ["Not-Check-in", "Checked-in", "Boarded"];
const bagLocations: string[] = [
    "Check-in counter", // (Terminal and counter number)
    "Gate", // (Terminal and gate number)
    "Loaded" // (Airlines abbreviation - 2 letters and 4-digit flight number)
];

const numberOfBags: string[] = Array.from({length: 200}, (_, i) => i.toString());

export {
    toTitleCase,
    toCamelCase,
    toSentenceCase,
    formatAirline,
    isNumeric,
    clearErrorAndSet,
    clearErrorAndSetString,
    clearOutcomeError,
    clearOutcomeErrorString,
    getAirlineAbbreviation,
    getAirlineByCode,
    namePattern,
    emailRegex,
    passwordRegex,
    numberOfBags,
    manualCounters,
    manualAirlines,
    manualGates,
    manualTerminals,
    statuses,
    bagLocations
};

