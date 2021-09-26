const fs = require('fs');

function dateTimePad(value, digits) {
    let number = value;
    while (number.toString().length < digits) {
        number = "0" + number;
    }
    return number;
}

function format(tDate) {
    return (
        dateTimePad((tDate.getFullYear()), 4) + "-" +
        dateTimePad((tDate.getMonth() + 1), 2) + "-" +
        dateTimePad(tDate.getDate(), 2) + " " +
        dateTimePad(tDate.getHours(), 2) + ":" +
        dateTimePad(tDate.getMinutes(), 2)) + ":" +
        dateTimePad(tDate.getSeconds(), 2) + "." +
        dateTimePad(tDate.getMilliseconds(), 3);
}

class Logger {
    constructor() {
        this.logStream = fs.createWriteStream(`${process.cwd()}/JSbot.log`);
    }

    /**
     *
     * @param {String} content
     * @param {'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'CMD' | 'READY'} type
     */
    log(content, type = 'INFO') {
        const timestamp = format(new Date(Date.now()));

        this.logStream.write(`${timestamp} ${type} - ${content} \n`);
    }
}

module.exports = { Logger }