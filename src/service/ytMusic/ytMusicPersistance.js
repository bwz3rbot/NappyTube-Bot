// Youtube Music Persistance

const
    ytMusic = require('./ytMusic'),
    client = require('../../config/Discord').client


// [Get URL]
async function getUrl(msg) {

    // Query the Database for the currentlyPlaying Object
    let currentURL = await client.getCurrentlyPlaying.get(msg.guild.id);
    if (!currentURL) { // If it does not exist yet,
        // Create a new field
        currentURL = {
            id: msg.guild.id,
            guild: msg.guild.id,
            playing: "https://youtu.be/0-JmHwVMhWM"
        }
        // Persist to the DB
        await setUrl(msg, currentURL.playing)
    }
    // Return the url
    return currentURL.playing;
}

// [Set URL]
// Persist a currentlyPlaying object to the db
async function setUrl(msg, url) {
    current = {
        id: msg.guild.id,
        guild: msg.guild.id,
        playing: url
    }
    const currentlyPlaying = await client.setCurrentlyPlaying.run(current)
    return currentlyPlaying.playing;
}



module.exports = {
    setUrl,
    getUrl
}