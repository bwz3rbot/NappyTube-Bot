const
    ytdl = require('ytdl-core'),
    // Timer = require('../../../common/util/Timer').Timer; // TODO: Remove this when testing is complete.
    // [Create New Stream]
    // Plays the next when stream emites finished.
    Broadcasts = new Map();
//TODO update with libsodium-wrappers (package already installed)
// https://www.npmjs.com/package/libsodium-wrappers


async function createNewStream(broadcast, PlaylistName, track, play_next_track, debug_track) {
    // TODO: Update this function to only take the BroadcastManager as a variable
    // The Broadcast Manager should have access to all of these fields.
    console.log("NOW PLAYING: ".blue, PlaylistName)
    console.log(track)

    let newStream;
    try {
        console.log("Setting the stream...".yellow)
        newStream = ytdl(track.url, {
            highWaterMark: 1 << 25
        })
    } catch (err) {
        console.log("YTDL FAILED TO INIT STREAM! ".red)
        return debug_track(err, broadcast)
    }
    // let timer = new Timer()
    let broadcastDispatcher;
    try {
        broadcastDispatcher = broadcast.play(newStream, {
            plp: 25,
            fec: true,
            bitrate: 'auto',
            // highWatermark: 75
            highWatermark: 1 << 25
        });
    } catch (err) {
        console.log("BROADCAST ERROR: ", err);
        console.log("Error while creating the dispatcher! Debugging the track!")
        return debug_track(err, broadcast)
    }


    // TODO: This should be done in another place. IE: The BroadcastManager.
    const BroadcastData = {
        track,
        stream: newStream,
        broadcastDispatcher,
        PlaylistName,
        // timer
    }
    broadcast._BroadcastData = BroadcastData
    broadcast._play_next_track = play_next_track // TODO: This function can be added to the broadcasts in the PlaylistManager.
    broadcast._debug_track = debug_track // Same with this one.

    // TODO: Why are we making another Broadcast Map when there is already one made?
    // Get the Broadcast Map from the Broadcast Manager once its in place.
    Broadcasts.set(PlaylistName, broadcast)

    const info = await ytdl.getBasicInfo(track.url);

    await addInfoListener(newStream, broadcast) //TODO: This is confusing. Call this method with the stream, not the Broadcast.
    await addErrorListener(newStream, broadcast)
    // TODO: fix this. its spamming the chat when it keeps failing to initialize.
    // await addReadyListener(broadcast)
    await addFinishListener(broadcast)

    newStream.emit("info", (info));





    // return BroadcastData; // Not sure if this even needs to be here?
}

// [Add Finish Listener To Each Stream In Map]

// THE OLD ON INFO LISTENER:
async function addInfoListener(stream, broadcast) {
    console.log("adding info listener to the stream...".yellow)
    stream.on('info', async (info) => {
        console.log("STREAM EMITTED INFO:... ")

        const Embed = broadcast._infoEmbed(info)
        broadcast._ytInfoEmbed = Embed;
        broadcast._embeddedInfo = Embed;
        let playlistEmbed = broadcast._buildPlaylistEmbed(broadcast._BroadcastData)
        broadcast._playlistInfoEmbed = playlistEmbed
        // for (const [k, v] of broadcast._connections) {
        //     if (v.listening_to == broadcast._BroadcastData.PlaylistName) {
        //         try {
        //             await v.text_channel.send(Embed)
        //         } catch (err) {
        //             console.log(err)
        //         }
        //     }
        // }
    })
}
// const addInfoListener = async function (broadcast) {
//     console.log("adding info listener to the stream...".yellow)
//     broadcast._BroadcastData.stream.on('info', async (info) => {
//         let Embed = broadcast._infoEmbed(info)
//         broadcast._embeddedInfo = Embed;
//     })
// }


// [Broadcast Error Listener]
async function addErrorListener(stream, broadcast) {
    console.log("Adding error listener to the broadcast.".green)
    broadcast._BroadcastData.broadcastDispatcher.on('error', (err) => {
        console.log("Dispatcher Error!".red, err)
    })
    console.log("Adding error listener to the stream.".green)
    stream.on('error', async (err) => {
        console.log("Stream Error: ", err)
        console.log("Error emitted. Asking Playlist Manager to Debug stream".red)
        await broadcast._debug_track(err, broadcast)
    })
}

// async function addReadyListener(broadcast) {
//     console.log("adding ready listener to the broadcast...".yellow)
//     broadcast.on("ready", async () => {
//         console.log("broadcast emitted a ready.".green)
//         let Embed = broadcast._embeddedInfo
//         for (const [k, v] of broadcast._connections) {
//             if (v.listening_to == broadcast._BroadcastData.PlaylistName) {
//                 try {
//                     await v.text_channel.send(Embed)
//                 } catch (err) {
//                     console.log(err)
//                 }
//             }
//         }

//     })

// }
async function addFinishListener(broadcast) {
    console.log("adding finish listener to the broadcast dispatcher...".yellow)

    broadcast._BroadcastData.broadcastDispatcher.on('finish', async () => {
        // broadcast._BroadcastData.timer.end()
        if (broadcast._BroadcastData.stream) {
            await broadcast._BroadcastData.stream.destroy() // TODO: Maybe this is no? 
        }

        console.log("Finished adding the listener. awaiting broadcast.playnext track")
        await broadcast._play_next_track(broadcast)
    })
}



module.exports.createNewStream = createNewStream