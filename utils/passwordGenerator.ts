/// utils/passwordGenerator.ts

/* Rules enforced:
≥ 6 characters
≥ 1 _uppercase
≥ 1 _lowercase
≥ 1 number

RETURN: A7f2bQ */

const _upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const _lower = "abcdefghijklmnopqrstuvwxyz";
const _digits = "0123456789";
const _all = _upper + _lower + _digits;

const randomChar = (chars: string) =>
    chars[Math.floor(Math.random() * chars.length)];

export const passwordGenerator = (length = 6): string => {
    if (length < 6) {
        throw new Error("Password length must be at least 6");
    }

    const passwordChars = [
        randomChar(_upper),
        randomChar(_lower),
        randomChar(_digits)
    ];

    while (passwordChars.length < length) {
        passwordChars.push(randomChar(_all));
    }

    return passwordChars
        .sort(() => Math.random() - 0.5)
        .join("");
};
