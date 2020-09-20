const
    Database = require('better-sqlite3'),
    Napster_Playlists_DB = new Database('./SQLDATA/Napster/Playlists.sqlite', {
        verbose: console.log,
        fileMustExist: false,
        timeout: 7000,
    }),
    __ = require("colors")

// [Create Many Tables Generated From Napster Data]
async function create_tables(playlists) {
    console.log("Creating the tables for playlists: ".magenta, playlists)

    // For Each Playlist
    for (const [k, v] of playlists) {
        console.log("Table Name: ".yellow, k)

        // Create Table With The Name of the Playlist
        await create_table(k)

        console.log("Table Contents: ", v)
        console.log("Inserting Values Into Table...".yellow)
        let count = 0;
        for (const [i, x] of v) {
            console.log("Inserting this value: ", x)
            insert_value_into_table(k, x, Math.floor(count++))

        }
    }

}

let Tables = new Map
// [Create A Unique Table For Each Playlist ]
async function create_table(TABLE_NAME) {
    console.log("CREATING TABLE".gray)
    let table = Napster_Playlists_DB.prepare(
        `SELECT count(*) FROM sqlite_master WHERE type='table' AND name='${TABLE_NAME}';`
    ).get();
    if (!table['count(*)']) {
        Napster_Playlists_DB.prepare(
            `CREATE TABLE ${TABLE_NAME} (track TEXT PRIMARY KEY, artist TEXT, napsterArtistId TEXT, albumName TEXT, songName TEXT, napsterSongId TEXT , napsterUrl TEXT, isExplicit NUMBER, isNapsterStreamable NUMBER , url TEXT, DEBUG text, DEBUG_URLS TEXT);`
        ).run();
        Napster_Playlists_DB.prepare(
            `CREATE UNIQUE INDEX idx_${TABLE_NAME}_id ON ${TABLE_NAME} (track);`
        ).run();
        Napster_Playlists_DB.pragma("synchronous = 1")
        Napster_Playlists_DB.pragma("journal_mode = wal")
    }

    getTrack = Napster_Playlists_DB.prepare(`SELECT * FROM ${TABLE_NAME} WHERE track = ?;`)
    setTrack = Napster_Playlists_DB.prepare(`INSERT OR REPLACE INTO ${TABLE_NAME} (track, artist, napsterArtistId, albumName, songName, napsterSongId, napsterUrl, isExplicit, isNapsterStreamable, url, DEBUG, DEBUG_URLS) VALUES (@track, @artist, @napsterArtistId, @albumName, @songName, @napsterSongId, @napsterUrl, @isExplicit, @isNapsterStreamable, @url, @DEBUG, @DEBUG_URLS);`)
    Tables.set(TABLE_NAME, {
        getTrack,
        setTrack
    })

}

async function insert_value_into_table(table, values, count) {
    // console.log("Table: ", table)
    // console.log("Values: ", values)
    // Get table with name ${table}
    let explicit = 0;
    if (values.isExplicit === true) {
        explicit = 1
    };
    let streamable = 0;
    if (values.isNapsterStreamable === true) {
        streamable = 1
    };
    table = Tables.get(table)
    table.setTrack.run({
        track: count.toString(),
        artist: values.artist,
        napsterArtistId: values.napsterArtistId,
        albumName: values.albumName,
        songName: values.songName,
        napsterSongId: values.napsterSongId,
        napsterUrl: values.napsterUrl,
        isExplicit: explicit,
        isNapsterStreamable: streamable,
        url: "__",
        DEBUG: "0",
        DEBUG_URLS: ""
    })
}


//// [Init Data]
// Takes In  list of Channel Names,
// Creates Accessors for the data,
// Returns the Accessors
async function init_accessors(PlaylistNames = Array) {

    console.log("Initializing the Data....".red)
    let PlaylistAccessors = new Map
    for (i = 0; i < PlaylistNames.length; i++) {
        getTrack = Napster_Playlists_DB.prepare(`SELECT * FROM ${PlaylistNames[i]} WHERE track = ?;`)
        setTrack = Napster_Playlists_DB.prepare(`INSERT OR REPLACE INTO ${PlaylistNames[i]} (track, artist, napsterArtistId, albumName, songName, napsterSongId, napsterUrl, isExplicit, isNapsterStreamable,url) VALUES (@track, @artist, @napsterArtistId, @albumName, @songName, @napsterSongId, @napsterUrl, @isExplicit, @isNapsterStreamable, @url);`)
        updateTrackUrl = Napster_Playlists_DB.prepare(
            `UPDATE ${PlaylistNames[i]} SET url = @url WHERE track = @track;`)
        debugTrack = Napster_Playlists_DB.prepare(
            `UPDATE ${PlaylistNames[i]} SET DEBUG = @DEBUG WHERE track = @track;`)
        setDebugUrls = Napster_Playlists_DB.prepare(
            `UPDATE ${PlaylistNames[i]} SET DEBUG_URLS = @DEBUG_URLS WHERE track = @track;`
        )
        PlaylistAccessors.set(PlaylistNames[i], {
            getTrack,
            setTrack,
            updateTrackUrl,
            debugTrack,
            setDebugUrls
        })
    }
    console.log("Returning the Generated Playlist Accessors: ", PlaylistAccessors)
    return PlaylistAccessors

}

module.exports = {
    create_tables,
    init_accessors
}