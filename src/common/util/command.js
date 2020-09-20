// Takes in a string, 
// checks if that string starts with '!',
// returns false if not.
const pre = "!"
const prefix = function (str) {
    if (str.startsWith(pre)) {
        return true
    }
}

// Takes in a string,
// Splits it into an array of arguments,
// Returns the command object.
const buildCMD = function (str) {
    args = str.slice(pre.length).trim().split(/ +/g)
    directive = args.shift().toLowerCase();
    command = {
        directive,
        args
    }
    return command;
}

module.exports = {
    prefix: prefix,
    buildCMD: buildCMD
}