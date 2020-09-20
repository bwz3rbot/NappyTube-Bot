const
    BroadcastManager = require('./BroadcastManager'),
    Broadcasts = BroadcastManager.getBroadcasts(),
    Connections = BroadcastManager.getConnections(),
    PlaylistNames = require('../../common/PlaylistNames').PlaylistNames, // TODO: get these playlist names from the Broadcast Manager
    ___ = require('colors'),
    devEmbed = require('../../common/embed').devEmbed;

async function listen(message, args) { // TODO: see if changing ChannelName to PlaylistName broke anything.
    let PlaylistName = validatePlaylistName(args.toString())
    if (!PlaylistName) {
        return message.channel.send("That channel does not exist!: " + args.toString())
    } else {
        if (message.member.voice.channel) {

            let connection = await message.member.voice.channel.join();
            let broadcast = Broadcasts.get(PlaylistName)
            // First, check if already connected to the text channel
            if (Connections.get(message.channel.name)) {
                Connections.delete(message.channel.name)
            }
            Connections.set(message.channel.name, {
                voice_connection: connection,
                text_channel: message.channel,
                listening_to: PlaylistName
            })

            // Play the broadcast
            await connection.play(broadcast)
            await message.channel.send(broadcast._playlistInfoEmbed)
            // if (broadcast._embeddedInfo) {
            //     await message.channel.send(broadcast._embeddedInfo)
            // }

        } else {
            return message.channel.send("Join a voice channel First!")

        }
    }
}

// [Send Playlist Info Embed]
async function info(message) {
    let ConnectionData = Connections.get(message.channel.name)
    if (ConnectionData) {
        let Broadcast = Broadcasts.get(ConnectionData.listening_to)
        await message.channel.send(Broadcast._playlistInfoEmbed)

    }

}
// [Send Playlist Info Embed]
async function moreInfo(message) {
    let ConnectionData = Connections.get(message.channel.name)
    if (ConnectionData) {
        let Broadcast = Broadcasts.get(ConnectionData.listening_to)
        await message.channel.send(Broadcast._ytInfoEmbed)

    }

}
// [Send Developer Info Embed]
async function devInfo(message) {
    let ConnectionData = Connections.get(message.channel.name)
    if (ConnectionData) {
        let Broadcast = Broadcasts.get(ConnectionData.listening_to)
        await message.channel.send(Broadcast._devEmbed())
    } else {
        await message.channel.send(devEmbed())
    }

}

// [Play Next Track]
async function next(message) {
    if (validateAdministrator(message)) {
        // Find the broadcast currently being listened to
        let connection = Connections.get(message.channel.name)
        let Broadcast = Broadcasts.get(connection.listening_to)
        // Then get its stream and tell it to emit a finish
        let dispatcher = Broadcast._BroadcastData.broadcastDispatcher
        return dispatcher.emit("finish")
    }

}

// [Leave Voice Channel]
async function leave(message) {
    let ConnectionData = Connections.get(message.channel.name)
    // let Broadcast = Broadcasts.get(connection.listening_to)
    let connection = ConnectionData.voice_connection
    // Broadcast.
    await message.channel.send("Goodbye!")

    await connection.disconnect()
    Connections.delete(message.channel.name)
    // TODO: check if this works.
    // This was changed from Broadcasts.delete(message.channel.name)
    //  I think this should be correct.


}


// validate playlist name and return the one closest to the one typed.
const validatePlaylistName = function (queryChannel = String) {
    queryChannel = queryChannel.toString().toLowerCase().replace(",", " ")
    for (i = 0; i < PlaylistNames.length; i++) {
        if (PlaylistNames.formatted[i].includes(queryChannel)) {
            return PlaylistNames[i];
        }
    }

}


// debug stream
async function debug(message) {
    if (validateAdministrator(message)) {
        let ConnectionData = Connections.get(message.channel.name)
        let Broadcast = Broadcasts.get(ConnectionData.listening_to)
        let stream = Broadcast._BroadcastData.stream
        return stream.emit("error")
    }


}




// [Validate Admin]

const ADMIN_ID = '752946263254630531';
const validateAdministrator = function (message) {
    console.log("VALIDATING ADMIN...")
    return message.author.id === ADMIN_ID ? true : false;
}


module.exports = {
    listen,
    leave,
    debug,
    next,
    info,
    moreInfo,
    devInfo
}