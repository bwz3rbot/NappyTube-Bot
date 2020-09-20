const
    dateFormat = require('dateformat'),
    __ = require('colors')

class Timer {
    constructor() {
        this.startTime = new Date;
        this.formattedStartTime = dateFormat(this.startTime)
        this.endTime;
        this.formattedEndTime;
        this.timeDiff;
        this.seconds;
        console.log(`starting at ${this.formattedStartTime}`.green)
    }


    end = function () {
        this.endTime = new Date();
        this.formattedEndTime = dateFormat(this.endTime)
        console.log(`ending at ${this.formattedEndTime}`.yellow)
        this.timeDiff = this.endTime - this.startTime;
        this.timeDiff /= 1000;
        this.seconds = Math.round(this.timeDiff);
        console.log(`seconds elapsed: ${this.seconds}`.magenta)
    }
}
module.exports.Timer = Timer