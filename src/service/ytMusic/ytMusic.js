const
    colors = require('colors'),
    yt = require('ytdl-core'),
    embed = require('../../common/embed'),
    validURL = require('../../common/util/validateURL').validURL,
    stream = require('stream'),
    util = require('util'),
    ytMusicPersistance = require('./ytMusicPersistance'),
    client = require('../../config/Discord').client

// Config Options for the stream
requestOptions = {
    maxRedirects: 100,
    maxRetries: 10,
    maxReconnects: 10,
    retryOnAuthError: true,
    highWatermark: 1 << 25
};

// MORE INFO ON STREAMS AND USING YTDL:
// https://nodejs.org/en/docs/guides/backpressuring-in-streams
// https://discord.js.org/#/docs/main/stable/typedef/StreamOptions
// https://discord.js.org/#/docs/main/stable/class/VoiceConnection?scrollTo=play
// https://discordjs.guide/voice/the-basics.html#joining-voice-channels


////
// PAUSABLE PASS THROUGH BEGINS HERE
function PausablePassThrough(options) {
    stream.Transform.call(this, options);
    this.paused = false;
    this.queuedCallbacks = []
};
PausablePassThrough.prototype.togglePause = function (paused) {
    this.paused = paused;
    if (!this.paused) {
        while (this.queuedCallbacks.length) {
            this.queuedCallbacks.shift()();
        }
    }
};
PausablePassThrough.prototype._transform = function (chunk, encoding, cb) {
    this.push(chunk);
    if (this.paused) {
        this.queuedCallbacks.push(cb);
    } else {
        cb();
    }
};
util.inherits(PausablePassThrough, stream.Transform);
////
//

// [Play]
let dispatcher;
let ytStream;
let Streams = new Map
let Dispatchers = new Map
async function play(msg, url, ACTION) {
    // First check for an existing stream
    let existing = Streams.get(msg.guild.id)
    // Then, check if it is paused
    if (existing != undefined && existing.IS_PAUSED) {
        // If play is called without a new url from a paused state
        if (url == existing._URL) {
            // Unpause
            url = existing._URL
            existing.IS_PAUSED = false
            existing.togglePause(false)
            // If playNext() was called
            if (ACTION === 'NEXT') {
                // Play the next song.     
                return play(msg, url)
            }
            return existing.togglePause(false)
        }
        // If play is called with a new url...

    }

    if (!url) { // if called with no args, play from previous url
        const current = await getUrl(msg)
        url = current;
    }
    // Check url is valid
    if (!validURL(url)) {
        msg.channel.send("Must be a valid URL")
        return
    }
    // Check for available voice channel
    voiceChannel = msg.member.voice.channel;
    if (!voiceChannel) { // If user does not belong to a voice channel, return
        return msg.reply("You must join a voice channel first!")
    }

    // Join the voice channel if available
    const connection = await voiceChannel.join()

    // If dispatcher already exists...
    if (dispatcher != undefined) { // Bot is already playing music!
        // Garbage collect the existing stream...
        ytStream.destroy()
        // Do the same with the dispatcher...
        dispatcher = undefined;
        // Start the stream.
        return play(msg, url)
    }

    // Get the stream from youtube
    ytStream = await yt(url, requestOptions)
    // Create a pauseable stream
    let pauseableStream = new PausablePassThrough();
    pauseableStream.URL = url
    ytStream.pipe(pauseableStream)

    // Insert it into a Map with key = guild.id
    Streams.set(msg.guild.id, pauseableStream)


    // Persist the currently playing url to the guild's database
    await setUrl(msg, url)

    // Streaming begins! Alert the masses!
    msg.channel.send('Playing: ' + url)
    console.log("Playing from ", url)

    // Write output stream to voice connection
    dispatcher = connection.play(pauseableStream, {
        quality: 'highestaudio',
        plp: 15,
        fec: true,
        bitrate: 'auto',
        highWatermark: 1 << 25
    })
    // Insert the dispatcher into the map

    // Handle Youtube Error
    ytStream.on('error', (err) => {
        console.log("YTSTREAM ERROR: ".red)
        console.dir(err)
        ytStream.destroy();
        play(msg, 'https://youtu.be/f02mOEt11OQ')
    })

    // Handle Dispatcher Error
    dispatcher.on('error', (err) => {
        console.log("DISPATCHER ERROR: ".red)
        console.dir(err)
        msg.channel.send('There was an error! Now exiting.', {
            tts: true
        })

    })
    // Play the next song when finished with one.
    dispatcher.on('finish', () => {
        ytStream.destroy();
        pauseableStream.destroy();
        dispatcher.destroy();
        playNext(msg)
    });
}

// [See Related]
async function seeRelated(msg) {
    // Get currently playing url
    const URL = await getUrl(msg)
    // Get yt info 
    const info = await yt.getBasicInfo(URL)
    // Build Embed
    relatedList = []
    for (i = 0; i < 6; i++) {
        relatedList.push(info.related_videos[i])
    }
    // Send Embed
    msg.channel.send(embed.buildEmbed(relatedList, URL))
}


// [Play Next]
async function playNext(msg) {
    // Get the currently playing url from the database
    const url = await getUrl(msg)
    // Load info about that url
    const info = await yt.getBasicInfo(url)
    // Generate a new url off the previous one.
    id = info.related_videos[0].id
    // set default id if error is thrown,
    // and play is called with bad url.
    newURL = 'https://youtu.be/' + id
    play(msg, newURL, 'NEXT')
}

// [Pause]
async function pause(msg) {
    msg.channel.send("Your music is paused. type !play to resume.")
    readable = Streams.get(msg.guild.id)
    readable.IS_PAUSED = true
    readable.togglePause(true);


}

//  [Stop]
async function stop(msg) {
    voiceChannel = msg.member.voice.channel;
    if (!voiceChannel) {
        return msg.channel.send("You aren't in a voice channel!")
    }
    voiceChannel.leave();
}

// [Bot Join Channel]
async function botJoinChannel(msg) {
    voiceChannel = msg.member.voice.channel;
    if (!voiceChannel) {
        return false;
    } else {
        await voiceChannel.join()
        return true;
    }
}

// [Get Info]
async function getInfo(msg) {
    url = await getUrl(msg)
    info = await yt.getBasicInfo(url)
    videoInfo = {}

    videoInfo.author = info.author,
        videoInfo.title = info.title,
        videoInfo.description = info.description,
        videoInfo.length = info.length_seconds,
        videoInfo.published = info.published,
        videoInfo.video_url = info.video_url,
        videoInfo.likes = info.likes,
        videoInfo.dislikes = info.dislikes
    videoInfo.ID = info.video_id

    videoInfoEmbed = embed.infoEmbed(videoInfo)
    msg.channel.send(videoInfoEmbed)
}

// [Get Related List]
async function getRelatedList(msg) {
    const url = await getUrl(msg)
    const info = await yt.getBasicInfo(url)
    return info.related_videos

}


// [Set Currently Playing URL]
const setUrl = function (msg, URL) {
    return ytMusicPersistance.setUrl(msg, URL)
}

// [Get Currently Playing URL]
const getUrl = function (msg) {
    return ytMusicPersistance.getUrl(msg)
}


// [Debug Stream]
const debug = function (msg) {
    const debug_stream = Streams.get(msg.guild.id)
    const debug_dispatcher = Dispatchers.get(msg.guild.id)
    console.log("STREAM: ", debug_stream)
    console.log("dispatcher: ", debug_dispatcher)
}

module.exports = {
    play,
    pause,
    stop,
    playNext,
    getInfo,
    botJoinChannel,
    seeRelated,
    getUrl,
    debug
}