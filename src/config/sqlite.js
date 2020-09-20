const
    SQLite = require('better-sqlite3'),
    ytMusicDB = new SQLite('./SQLDATA/ytMusic.sqlite')

// [Init]
// Required in the config/login.js file,
// Called in the on('ready') event.
async function init(client) {
    await init_yt_music(client)
}




// YT_MUSIC DB
async function init_yt_music(client) {
    const table =
        ytMusicDB.prepare(
            "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='guild_CurrentlyPlaying';"
        ).get();
    if (!table['count(*)']) {
        ytMusicDB.prepare(
            "CREATE TABLE guild_CurrentlyPlaying (id TEXT PRIMARY KEY, guild TEXT, playing TEXT);"
        ).run();
        ytMusicDB.prepare(
            "CREATE UNIQUE INDEX idx_playing_id ON guild_CurrentlyPlaying (id);"
        ).run();
        ytMusicDB.pragma("synchronous = 1")
        ytMusicDB.pragma("journal_mode = wal")
    }
    client.getCurrentlyPlaying = ytMusicDB.prepare("SELECT * FROM guild_CurrentlyPlaying WHERE guild = ?;")
    client.setCurrentlyPlaying = ytMusicDB.prepare("INSERT OR REPLACE INTO guild_CurrentlyPlaying (id, guild, playing) VALUES (@id, @guild, @playing);")
}

module.exports.init = init;