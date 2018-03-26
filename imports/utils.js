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
