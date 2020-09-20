const
    Napster = require('../../search/Napster'),
    Youtube = require('../../search/youtube'),
    // TODO: stop requiring StreamManager here and get it from the BroadcastManager instead.
    StreamManager = require('../Streams/StreamManager');


// TODO: Seperate this Database Initializer to a seperate file.

/////////////////////////////////
////// Filling The Database...
/////// Thank you, Napster!
// [Get top 200]
let Top_200 = Map;
async function getTop_200() {
    Top_200 = await Napster.getTopTracks()
    return Top_200

}
// [Get Top Artist/Top Tracks]
let TopArtistsTracksMap = Map
async function getTop_Artists_Tracks() {
    TopArtistsTracksMap = await Napster.getTopArtistsTracks()
    return TopArtistsTracksMap

}
// [Build Playlists]
let AllPlaylists = new Map
async function buildPlaylists() {
    console.log("BUILDING PLAYLISTS".magenta)
    // Get Top 200
    console.log("awaiting getTop_200")
    const Top_200 = await getTop_200();
    AllPlaylists.set('Top_200', Top_200)
    // Get Top Artists Tracks
    console.log("Awaiting get Top Artists Top Tracks...")
    const Top_Artists_Top_Tracks = await getTop_Artists_Tracks()
    console.log("Setting Top Artists/TopTracks...")
    AllPlaylists.set('Top_Artists_Top_Tracks', Top_Artists_Top_Tracks)
    console.log("All playlistts are set! Here they are: ".green, AllPlaylists)
    return AllPlaylists
}
//////////////////////////////////////////////
//////////////////////////////

// Database Is full. 
// Here is where we get the stuff out.

const
    NapsterDB = require('../../../config/NapsterDB'); // TODO: why is this being required here?? Get it from the Broadcast Manager!

// [Init Data]
let PlaylistAccessors; // TODO: this is kind of weird. Why are we creating this here then making it a new Map in the init_accessors function?
async function init_data(PlaylistNames) { // TODO: Attach these names to this file instead.
    PlaylistAccessors = await NapsterDB.init_accessors(PlaylistNames);
}

// [Init Streams]
async function broadcast_streams(Broadcasts = Map) {
    console.log("BROADCASTING STREAMS WITH THESE BROADCASTS: ", Broadcasts)
    // const FIRST_TRACK_NUMBER = "0";
    let FIRST_TRACK_NUMBER = randomize()
    FIRST_TRACK_NUMBER = Math.floor(FIRST_TRACK_NUMBER)
    FIRST_TRACK_NUMBER = FIRST_TRACK_NUMBER.toString();
    // console.log("First track to search == ", FIRST_TRACK_NUMBER)



    console.log("Initializing streams with broadcasts:\n\n ".america)

    // Find the first URL from Youtube Search API
    for (const [k, v] of Broadcasts) {
        let broadcast = v
        let playlistName = k
        let Playlist = PlaylistAccessors.get(k)

        let track = await Playlist.getTrack.get(FIRST_TRACK_NUMBER)
        console.log("Found this track: ", track)

        await update_url(track, Playlist) // TODO: fix this so we aren't making two database queries.
        track = await Playlist.getTrack.get(FIRST_TRACK_NUMBER)

        // TODO: should await the return of the broadcast Data and use it to get the next track, maybe?
        await StreamManager.createNewStream(broadcast, playlistName, track, play_next_track, debug_track)
    }
}

// [Update URL]
async function update_url(track, Playlist) {
    console.log("Found track: ", track)
    // TODO: update (Playlist) to (PlaylistAccessors), instead of Playlist. It's confusing. Attach The accessors to the playlist instead.
    if (track.url === "__") {
        let query = `${track.artist} ${track.songName} ${track.albumName} OFFICIAL `
        console.log("Asking Youtube for Search: ".red, query)

        let results = await Youtube.search(query)
        results = results.data.items

        let debug_urls = new Array
        results.forEach(item => {
            if (item.id.kind === "youtube#video") {
                let ytID = item.id.videoId
                let url = 'https://youtu.be/' + ytID
                debug_urls.push(url)
            }
        })

        await Playlist.updateTrackUrl.run(({
            track: track.track,
            url: debug_urls[0]
        }))
        await Playlist.setDebugUrls.run(({
            track: track.track,
            DEBUG_URLS: debug_urls.toString()
        }))
        track.url = debug_urls[0];
    }
    return track;
}

async function play_next_track(broadcast) {
    console.log("|| Playlist Manager || Playing Next Track...".yellow)
    let BroadcastData = broadcast._BroadcastData
    let trackNumber = parseInt(BroadcastData.track.track)
    //if (trackNumber > 200) {
      //  trackNumber == 0
    //} else {
     //   trackNumber++;
   // }

    trackNumber = randomize(trackNumber);
    let playlist = await PlaylistAccessors.get(BroadcastData.PlaylistName)
    let track = await playlist.getTrack.get(trackNumber.toString())
    // TODO: why are we calling await getTrack twice?
    try {
        await update_url(track, playlist)
    } catch (err) {
        if (err) {
            console.log("Error updating url! err: ", err)
            return play_next_track(broadcast)
        }
    }

    track = await playlist.getTrack.get(trackNumber.toString())

    return StreamManager.createNewStream(broadcast, BroadcastData.PlaylistName, track, play_next_track, debug_track)
}

const randomize = function (number) {

    newNumber = Math.floor(Math.random() * (199 - 0) + 0);
    if (number == newNumber) {
        randomize(number)
    }
    return newNumber;
}


// Gets the next search results from youtube
// updates the database,
// plays the stream from the new url.
async function debug_track(err, broadcast) {
    console.log("|| PLAYLIST MANAGER || Debugging the track!.".red, broadcast._BroadcastData.track)
    console.log("YOUTUBE ERROR: ", err)
    let BroadcastData = broadcast._BroadcastData
    let track = BroadcastData.track

    // Get the debug level...
    let debug_level = track.DEBUG
    console.log("DEBUG LEVEL:", debug_level)
    if (debug_level > track.DEBUG_URLS) {
        debug_level = 0;
    } else {
        debug_level++
    }

    console.log("DEBUG LEVEL NOW: ", debug_level)
    let playlist = await PlaylistAccessors.get(BroadcastData.PlaylistName) // TODO: change variable name playlist to PlaylistAccessor

    // Update the new debug value in the db
    await playlist.debugTrack.run({
        track: track.track,
        DEBUG: debug_level.toString()
    })
    console.log("Found these DEBUG_URLS:", track.DEBUG_URLS)
    let debug_urls_array = track.DEBUG_URLS.split(",")

    if (!debug_urls_array[debug_level]) {
        console.log(`debug_urls_array[${debug_level} did not exist! Playing the next track!`.red)
        return play_next_track(broadcast)
    }
    DEBUG_LEVEL_URL = debug_urls_array[debug_level]
    console.log(`Getting url from index ${debug_level}`, DEBUG_LEVEL_URL)

    console.log(`Updating the previous url: ${track.url}, to ${DEBUG_LEVEL_URL}`)
    await playlist.updateTrackUrl.run({
        track: track.track.toString(),
        url: DEBUG_LEVEL_URL
    })

    // TODO: Fix all the transactions so that there is only one per method.
    nextTrack = await playlist.getTrack.get(track.track.toString())

    console.log("Creating new stream with the updated track object: ", track)

    return play_next_track(broadcast)
    // return StreamManager.createNewStream(broadcast, BroadcastData.PlaylistName, nextTrack, play_next_track, debug_track)
}


module.exports = {
    buildPlaylists, // TODO: is this even being used?
    broadcast_streams,
    init_data,
    play_next_track // TODO: does this need to be exported if it's being added on as a callback?
}
