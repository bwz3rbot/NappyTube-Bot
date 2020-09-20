// 'bot-commands' channel
const
    command = require('../../common/util/command'),
    filter = require('../../common/util/filter-commands').filter,
    embed = require('../../common/embed'),
    subscribe = require('../broadcast/subscribe'),
    BroadcastManager = require('../broadcast/BroadcastManager')



// Run on message received from this channel
async function on(msg, client) {
    if (filter(msg, client, 'nappy-tube')) {
        cmd = command.buildCMD(msg.content)
        await processCommand(cmd, msg)
    }
}

// [bot-commands] Channel Commands:
async function processCommand(command, msg) {
    switch (command.directive) {
        case "listen":
            await subscribe.listen(msg, command.args)
            break;
        case "leave":
            await subscribe.leave(msg)
            break;
        case "debug":
            await subscribe.debug(msg)
            break;
        case "next":
            await subscribe.next(msg, command.args)
            break;
        case "stop":
            BroadcastManager.stopAllBroadcasts()
            break;
        case "info":
            await subscribe.info(msg)
            break;
        case "more":
            await subscribe.moreInfo(msg)
            break;
        case "dev":
            await subscribe.devInfo(msg)
            break;
        case "help":
            await msg.channel.send(embed.helpEmbed())
            break;
        default:
            await msg.channel.send(embed.helpEmbed())
            break;
    }
}

exports.on = on