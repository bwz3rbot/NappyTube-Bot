// Filter out commands by bots, those sent from this bot
// Filter by channel on a per-use basis
const command = require('./command')
const filter = function (msg, client, channelName) {
    if (
        !(msg.author === client.user) &&
        (msg.channel.name === channelName) &&
        command.prefix(msg.content)) {
        return true;
    }

}


exports.filter = filter;