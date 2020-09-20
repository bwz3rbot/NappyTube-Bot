const
    colors = require('colors'),
    Napster_DB = require('../../config/NapsterDB'),
    PlaylistManager = require('./Playlists/PlaylistManager'),
    // StreamManager = require('./Streams/StreamManager'),
    Embed = require('../../common/embed'), // TODO: Attach everything to the Broadcast Manager like this
    // TODO: Export StreamManager and have the PlaylistManager call it from this module (instead of requiring it twice).
    // StreamManager = require('../broadcast/Streams/StreamManager'),
    PlaylistNames = require('../../common/PlaylistNames').PlaylistNames; // TODO: Put this in the PlaylistManager file.

// [Init Broadcasts]
async function initBroadcasts(client) {
    console.log("|| BROADCAST MANAGER || Initiating the broadcasts...".yellow)
    // await UPDATE_DATABASE()

    // Init the Data Accessors
    console.log('|| BROADCAST MANAGER || Initializing the Data...'.yellow)
    console.log("Sending Playlist Names to init_data...".yellow)
    console.log(PlaylistNames)
    await PlaylistManager.init_data(PlaylistNames, client);

    // Create Broadcasts
    console.log("|| BROADCAST MANAGER || Creating Broadcasts...".magenta)
    const broadcasts = await createBroadcasts(PlaylistNames, client)


    console.log('|| BROADCAST MANAGER || Broadcasting The Streams.'.yellow)
    await PlaylistManager.broadcast_streams(broadcasts, client); // TODO: Broadcasting the streams should be handled by the Broadcast Manager.
}


// [Create Broadcast]
// Takes in an Array of Playlist Names
// Returns a Map of Broadcasts with one broadcast for each array name
let Broadcasts = new Map
let Connections = new Map
async function createBroadcasts(playlists = Array, client) {
    console.log("Creating the Broadcasts...")
    for (i = 0; i < playlists.length; i++) {
        let broadcast = await client.voice.createBroadcast();
        broadcast._buildPlaylistEmbed = Embed.playlistEmbed
        broadcast._infoEmbed = Embed.infoEmbed
        broadcast._devEmbed = Embed.devEmbed
        broadcast._playlistInfoEmbed = Embed.playlistInfoEmbed(playlists[i])
        broadcast._BroadcastManager = this
        //  Fix this.
        broadcast._connections = Connections
        console.log("Setting the broadcast to ", playlists[i])
        Broadcasts.set(playlists[i], broadcast)
    }
    console.log(Broadcasts)
    return Broadcasts;
}

// [Get Broadcasts]
const getBroadcasts = function () {
    return Broadcasts;
}
// [Get Connections]
const getConnections = function () {
    return Connections;
}

// [Update Database]
async function UPDATE_DATABASE() {
    // First Build The Playlists (playlists are built, now on the DB)
    console.log("|| BROADCAST MANAGER || Initializing Database Accessor Methods...".yellow)
    playlists = await PlaylistManager.buildPlaylists()
    console.log('|| BROADCAST MANAGER || Passing the playlists off to the DB...'.yellow)
    await Napster_DB.create_tables(playlists)
}


// [Stop All Broadcasts]
const stopAllBroadcasts = function () {
    Broadcasts = getBroadcasts()
    Broadcasts.forEach(broadcast => {
        broadcast.end();
    });
}

// TODO: Why are we exporting these?
// They should be accessable by the broadcast._BroadcastManager
module.exports = {
    initBroadcasts,
    getBroadcasts,
    getConnections, // YODO: This isn't being used?
    stopAllBroadcasts
}