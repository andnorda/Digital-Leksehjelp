import crypto from 'crypto';

const pad = n => (Number(n) > 9 ? n : `0${n}`);

export const timeSince = (date = new Date(), time = new Date()) => {
    const diff = time.getTime() - date.getTime();
    if (diff < 1) {
        return '0:00';
    }
    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / 60000) % 60;
    const hours = Math.floor(diff / 3600000);
    if (hours) {
        return `${hours}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${minutes}:${pad(seconds)}`;
};

export const getQueueTime = startTime =>
    Math.round((new Date().getTime() - startTime) / 60000);

export const urlify = str =>
    str
        .toLowerCase()
        .replace(/ +/g, '-')
        .replace(/æ/g, 'ae')
        .replace(/ø/g, 'o')
        .replace(/å/g, 'a')
        .replace(/[^a-z0-9-]/g, '');

const adjectives = [
    'Subtil',
    'Lycklig',
    'Blyg',
    'Rosa',
    'Lilla',
    'Nyfiken',
    'Rolig',
    'Bra',
    'Snabb',
    'Praktisk',
    'Mysig',
    'Ivrig',
    'Listig',
    'Snäll',
    'Genial',
    'Imponerande',
    'Rakad',
    'Vänlig',
    'Berömd',
    'Positiv',
    'Snygg',
    'Mild',
    'Uppmärksam',
    'Speciell',
    'Fräsch',
    'Hjälpsam',
    'Nådig',
    'Kreativ',
    'Hälsosam',
    'Säker'
];

const animals = [
    'panda',
    'giraff',
    'groda',
    'elefant',
    'älg',
    'uggla',
    'tiger',
    'björn',
    'lejon',
    'örn',
    'krokodil',
    'delfin',
    'zebra',
    'hår',
    'rev',
    'kamel',
    'haj',
    'gorilla',
    'papegoja',
    'flamingo',
    'stavning',
    'tätning',
    'pingvin',
    'känguru',
    'utter',
    'impala',
    'koala',
    'manet',
    'gräshoppa',
    'kivi'
];

export const generateNickname = (
    string = Math.floor(Math.random() * 1000000000).toString()
) => {
    const n =
        crypto
            .createHash('sha256')
            .update(string)
            .digest('hex')
            .split('')
            .reduce(function(sum, char) {
                return char.charCodeAt(0) + sum;
            }, 0) %
        (animals.length * adjectives.length);
    return `${adjectives[Math.floor(n / animals.length)]} ${
        animals[n % animals.length]
    }`;
};
