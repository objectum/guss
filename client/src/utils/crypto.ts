import CryptoJS from 'crypto-js';

export const hashPassword = (password: string): string => {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
};
