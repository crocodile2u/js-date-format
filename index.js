// Helper object
const DateFormat = {
    /**
     * @param {Date} d
     * @param {string} separator
     * @returns {string}
     */
    tz: (d, separator) => {
        const tzOffset = Date.FORMATS.Z(d);
        const tzOffsetAbs = Math.abs(tzOffset);
        const sign = (tzOffset >= 0) ? "+" : "-";
        const hours = padZero(Math.floor(tzOffsetAbs / 3600));
        const minutes = padZero(Math.floor(tzOffsetAbs % 3600 / 60));
        return `${sign}${hours}${separator}${minutes}`;
    },
    /**
     * @param {number} n
     * @returns {string}
     */
    padZero: (n) => (n < 10) ? (`0${n}`) : `${n}`
};
/**
 * the `d` param in every formatter is of @type {Date}
 *
 * For the formats reference, @see https://secure.php.net/manual/en/function.date.php
 *
 * @type {{Y: function(*): number, m: function(*): (*|string), d: function(*): (*|string), H: function(*): (*|string), i: function(*): (*|string), s: function(*): (*|string), D: function(*): string, l: function(*): string, N: function(*): number, j: function(*): number, S: Date.FORMATS.S, w: function(*): number, z: function(*=): number, L: Date.FORMATS.L, W: function(*): (*|string), F: function(*): string, M: function(*): string, n: function(*): number, t: function(*=): number, y: function(*): (*|string), a: function(*=): string, A: function(*=): string, g: function(*): number, G: function(*): number, h: function(*=): (*|string), Z: function(*): number, c: function(*=): *, r: function(*=): *, U: function(*): number}}
 */
Date.FORMATS = {
    Y: d => d.getFullYear(),
    m: d => DateFormat.padZero(d.getMonth() + 1),
    d: d => DateFormat.padZero(d.getDate()),
    H: d => DateFormat.padZero(d.getHours()),
    i: d => DateFormat.padZero(d.getMinutes()),
    s: d => DateFormat.padZero(d.getSeconds()),
    D: d => (["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])[d.getDay() - 1],
    l: d => (["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])[d.getDay() - 1],
    N: d => d.getDay(),
    j: d => d.getDate(),
    S: d => {// to form correct English number with suffix like 2nd, 3rd etc
        const j = d.getDate();
        if (j >= 10 && j <= 20) return 'th';
        switch (j % 10) {
            case 1:
                return 'st';
            case 2:
                return 'nd';
            case 3:
                return 'rd';
            default:
                return 'th';
        }
    },
    w: d => d.getDay() - 1,
    z: d => {// number of day within the year, starting from 0
        const year = Date.FORMATS.L(d) ? Date.LEAP_YEAR : Date.YEAR;
        return year.slice(0, d.getMonth()).reduce((a, b) => a + b) + d.getDate() - 1;
    },
    L: d => {// leap year?
        const Y = d.getFullYear();
        if (!(Y%400)) return 1;
        if (!(Y%100)) return 0;
        return (Y%4) ? 0 : 1;
    },
    W: d => {// https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php/6117889#6117889
        // Copy date so don't modify original
        let dc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        dc.setUTCDate(dc.getUTCDate() + 4 - (dc.getUTCDay()||7));
        // Get first day of year
        let yearStart = new Date(Date.UTC(dc.getUTCFullYear(), 0, 1));
        // Calculate full weeks to nearest Thursday
        let weekNo = Math.ceil(( ( (dc - yearStart) / 86400000) + 1)/7);
        // Return array of year and week number
        return DateFormat.padZero(weekNo);
    },
    F: d => Date.MONTHS[d.getMonth()],
    M: d => Date.MONTHS_SHORT[d.getMonth()],
    n: d => d.getMonth() + 1,
    t: d => (Date.FORMATS.L(d) ? Date.LEAP_YEAR : Date.YEAR)[d.getMonth()],
    y: d => DateFormat.padZero(d.getFullYear() % 100),
    a: d => Date.FORMATS.H(d) >= 12 ? 'pm' : 'am',
    A: d => Date.FORMATS.a(d).toUpperCase(),
    g: d => (d.getHours() % 12) || 12,
    G: d => d.getHours(),
    h: d => DateFormat.padZero(Date.FORMATS.g(d)),
    O: d => DateFormat.tz(d, ""),
    P: d => DateFormat.tz(d, ":"),
    Z: d => d.getTimezoneOffset() * -60,
    c: d => d.format("Y-m-dTH:i:s") + DateFormat.tz(d, ":"),
    r: d => d.format("D, d M Y H:i:s ") + DateFormat.tz(d, ""),
    U: d => Math.floor(d.getTime() / 1000)
};
// Number of days in months: regular year & leap year
Date.YEAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
Date.LEAP_YEAR = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

Date.MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
Date.MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// this is where the magic happens.
// we make a single regexp like this: /[YmdHisO......]/
Date.FORMATREGEXP = new RegExp(`[${Object.keys(Date.FORMATS).join("")}]`, 'g');
// ... and in format() we simply apply appropriate callback from Date.FORMATS
Date.prototype.format = function(format) {
    return format.replace(Date.FORMATREGEXP, (m) => Date.FORMATS[m].call(this, this));
};

module.exports = true;