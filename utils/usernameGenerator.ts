// utils/usernameGenerator.ts

// NOTE: Minimum two letters followed by two digits (non-admin only)
export const usernameGenerator = (firstName: string, lastName: string): string => {
    const letters = (firstName[0] || 'x') + (lastName[0] || 'x');

    const digits = Math.floor(10 + Math.random() * 90); // 2 digits

    return `${letters.toLowerCase()}${digits}`;
}