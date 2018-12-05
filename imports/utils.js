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
    'Glad',
    'Sjenert',
    'Rosa',
    'Lilla',
    'Nysgjerrig',
    'Løye',
    'Flink',
    'Rask',
    'Praktisk',
    'Koselig',
    'Ivrig',
    'Listig',
    'Snill',
    'Genial',
    'Imponerende',
    'Rakrygget',
    'Vennlig',
    'Berømt',
    'Positiv',
    'Arbeidsom',
    'Lun',
    'Oppmerksom',
    'Bestemt',
    'Frisk',
    'Hjelpsom',
    'Kjær',
    'Kreativ',
    'Sunn',
    'Trygg'
];

const animals = [
    'panda',
    'sjiraff',
    'frosk',
    'elefant',
    'elg',
    'ugle',
    'tiger',
    'bjørn',
    'løve',
    'ørn',
    'krokodille',
    'delfin',
    'zebra',
    'hare',
    'rev',
    'kamel',
    'hai',
    'gorilla',
    'papegøye',
    'flamingo',
    'grevling',
    'sel',
    'pingvin',
    'kenguru',
    'oter',
    'impala',
    'koala',
    'manet',
    'gresshoppe',
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

export const nickname = generateNickname();
