const axios = require('axios')

const NAPSTER_BASE_URL = 'https://api.napster.com/v2.2/'

// CHANNEL:
//// Top 200 Tracks
const top_tracks_url = NAPSTER_BASE_URL + 'tracks/top?limit=200&apikey=' + process.env.NAPSTER_KEY

// Query Napster For Top 200 Tracks of the Week
const queryTopTracks = function () {
    console.log("Querying Napster for Top 200 tracks...".yellow, top_tracks_url)
    return axios.get(top_tracks_url)
        .catch(err => console.log)
}

//  
const setTopTracksMap = function (response) {
    let topTracksMap = new Map()
    let count = 0
    response.data.tracks.forEach((track) => {
        topTracksMap.set(count, {
            artist: track.artistName,
            napsterArtistId: track.artistId,
            albumName: track.albumName,
            songName: track.name,
            napsterSongId: track.id,
            napsterUrl: track.href,
            isExplicit: track.isExplicit,
            isNapsterStreamable: track.isStreamable
        })
        count++
    })
    console.log("top tracks map: ", topTracksMap)
    return topTracksMap

}


// Full Get Top 200
async function getTopTracks() {
    return queryTopTracks()
        .then(setTopTracksMap)
}
////
//


// CHANNEL:
//// Top Artists Top Tracks

// Get Top Artists
// Returns an Async Request to Napster for the Current List of Top Artists
let artistsMap = new Map
const getTopArtists = function () {
    console.log("Getting the top Artists....")
    let top_artists_url = NAPSTER_BASE_URL + 'artists/top?limit=20&range=week&apikey=' + process.env.NAPSTER_KEY
    console.log("submitting query to ".magenta, top_artists_url)
    return axios.get(top_artists_url)
        .catch((err) => {
            console.log(err)
        })
}

// Set Artists Map
// Takes response from [Top Artists Query] and generates a map
const setArtistsMap = function (response) {
    let count = 0;
    response.data.artists.forEach((artist) => {
        artistsMap.set(count, {
            name: artist.name,
            id: artist.id
        })
        count++;
    })
    return artistsMap
}

// Get Artist(s) Collection(s)
let artistsCollectionsMap = new Map
async function getArtistsCollections(artistsMap) {
    let artist_count = 0;
    let track_count = 0

    for (const [key, artist] of artistsMap) {
        let tracksMap = new Map
        // Make a Request to Get the Collection for Each Artists in the map
        let response = await getArtistsCollection(artist.id)
        let artistColletion = response.data

        artistColletion.tracks.forEach((track) => {
            tracksMap.set(track_count++, {
                artist: track.artistName,
                napsterArtistId: track.artistId,
                albumName: track.albumName,
                songName: track.name,
                napsterSongId: track.id,
                napsterUrl: track.href,
                isExplicit: track.isExplicit,
                isNapsterStreamable: track.isStreamable
            })
        })
        let collection_data = {
            name: artist.name,
            tracksMap
        }
        artistsCollectionsMap.set(artist_count++, collection_data)
    }    
    return artistsCollectionsMap
}


// Get Artist Collection
const getArtistsCollection = function (id) {
    requestURL = NAPSTER_BASE_URL + 'artists/' + id + '/tracks/top?limit=10' + '&apikey=' + process.env.NAPSTER_KEY
    console.log(`Making request to Napster: `.bgBlue, requestURL)
    return axios.get(requestURL)
        .catch(err => console.log)
}

let Top_Artists_Top_Tracks = new Map
const setFinalCollection = function () {
    console.log("SETTING THE FINAL COLLECTION...")

    let count = 0;
    for (const [i, artist] of artistsCollectionsMap) {

        for (const [x, track] of artist.tracksMap)
        

            Top_Artists_Top_Tracks.set(count++, {
                artist: track.artist,
                napsterArtistId: track.napsterArtistId,
                albumName: track.albumName,
                songName: track.songName,
                napsterSongId: track.napsterSongId,
                napsterUrl: track.napsterUrl,
                isExplicit: track.isExplicit,
                isNapsterStreamable: track.isNapsterStreamable
            })

    }
    console.log("THE FINAL COLLECTION: ", Top_Artists_Top_Tracks)
    return Top_Artists_Top_Tracks
}



//// Full [Get Top Artists Top Tracks]
const getTopArtistsTracks = function () {
    return getTopArtists()
        .then(setArtistsMap)
        .then(getArtistsCollections)
        .then(setFinalCollection)

}

//// Get Top Artists/Top Tracks Ends Here
//





module.exports = {
    getTopTracks,
    getTopArtistsTracks
}