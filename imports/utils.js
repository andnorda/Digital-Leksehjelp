const pad = n => (Number(n) > 9 ? n : '0' + n);

export const timeSince = (date = new Date(), time = new Date()) => {
    const timeSince = time.getTime() - date.getTime();
    if (timeSince < 1) {
        return '0:00';
    }
    const seconds = Math.floor(timeSince / 1000) % 60;
    const minutes = Math.floor(timeSince / 60000) % 60;
    const hours = Math.floor(timeSince / 3600000);
    if (hours) {
        return hours + ':' + pad(minutes) + ':' + pad(seconds);
    } else {
        return minutes + ':' + pad(seconds);
    }
};
