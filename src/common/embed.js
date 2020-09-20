const Discord = require('discord.js') // TODO: don't require this from here.
const MusicalNote_image = 'https://raw.githubusercontent.com/NappyTube/nappytube/master/MEDIA/Musical_Note.png'
const DiscordBot_image = 'https://nappytube.github.io/nappytube/MEDIA/Nappy_DiscordIcon2.png'
const NappyN_image = 'https://nappytube.github.io/nappytube/MEDIA/Nappy_tube512x512.png'
const NappyDiamond_image = 'https://nappytube.github.io/nappytube/MEDIA/Diamondxcf.png'

// inside a command, event listener, etc.
const devEmbed = function () {
    let randomColor = getRandomColor();
    return new Discord.MessageEmbed()
        .setColor(randomColor)
        .setTitle('Check out my github!')
        .setURL('https://github.com/web-temps/')
        .setAuthor('NappyTube', DiscordBot_image, 'https://nappytube.github.io/nappytube/index.html')
        .setDescription("Need a bot made? I've got you covered!")
        .setThumbnail(NappyDiamond_image)
        .addFields({
            name: 'JavaScript Developer',
            value: `I develop applications in JavaScript to help accomplish all sorts of tasks.`
        }, {
            name: '\u200B',
            value: '\u200B'
        }, {
            name: 'Reddit Bots',
            value: '`Got Em✅`',
            inline: true,
        }, {
            name: 'Discord Bots',
            value: '`Got Em✅`',
            inline: true
        }, {
            name: 'Web Scrapers',
            value: '`Got Em✅`',
            inline: true
        }, {
            name: '\u200B',
            value: '\u200B',
            inline: false
        }, )
        .addField('Contact me on Reddit', 'https://www.reddit.com/u/Bwz3r', false)
        .addField('Contact me on Discord', 'https://discord.gg/bcEtSJx', false)
        .addField('View my Github Repo', 'https://github.com/web-temps', false)
        .addField("See the bot's homepage", 'https://nappytube.github.io/nappytube', false)
        .setTimestamp(Date.now())
        .setFooter('Thanks for listening!', NappyN_image);
}

// [Help Embed]
const helpEmbed = function () {
    let randomColor = getRandomColor()
    return new Discord.MessageEmbed()
        .setColor(randomColor)
        .setTitle("Try using one of these commands. Or checkout the website for more info.")
        .setURL('https://nappytube.github.io/nappytube/index.html')
        .addFields({
            name: "\u200B",
            value: ":musical_note: :heart: :musical_note: :heart: :musical_note:"
        }, {
            name: "!listen <Top 200, Top Artists>",
            value: "Subscribes you to either channel. Must be in a voice channel first."
        }, {
            name: "!leave",
            value: "Remove NappyTube from the voice channel."
        }, {
            name: "!info",
            value: "Displays information about the playlist."
        }, {
            name: "!dev",
            value: "Learn more about the developer."
        })
        .setFooter("Thanks for listening!", DiscordBot_image)
}
// // [Help Embed]
// const helpEmbed = function () {
//     return new Discord.MessageEmbed()
//         .setTitle("Try using one of these commands.")
//         .addFields({
//             name: "!listen <Top 200, Top Artists Top Tracks>",
//             value: "Subscribes you to either channel. Must be in a voice channel first."
//         }, {
//             name: "!stop",
//             value: "Stops all broadcasts."
//         }, {
//             name: "!next <Top 200, Artists>",
//             value: "Plays the next song on either broadcast."
//         },  {
//             name: "!info",
//             value: "Displays information about the current song."
//         },{
//             name: "!related",
//             value: "Displays a list of related titles."
//         }, )
// }

// Build Related Youtube Video List Embed:
const buildEmbed = function (list) { // TODO: get rid of this or fix it to work with the radio somehow.
    let embed = new Discord.MessageEmbed()
        .setTitle("ModBot Music Player")
        .setThumbnail(list[0].video_thumbnail)
        .setDescription(
            `Here's a list of titles related to the one you're currently on.
            Copy the url and run it with !play <url> to play.`
        )
    for (i = 0; i < list.length; i++) {
        time = calculateTime(list[i].length_seconds)
        embed.addField(time + " | " + list[i].title, "https://youtu.be/" + list[i].id)
    }
    return embed;
}

// Takes in an amount of time in seconds
// Returns a formatted string 
// containing minutes and seconds equal to the amount of seconds it receives.
const calculateTime = function (time) {
    let minutes = Math.floor(time / 60)
    let seconds = time - minutes * 60;
    let hours = Math.floor(time / 3600)
    // fullTime = time - hours * 3600;
    finalTime = str_pad_left(minutes, '0', 2) + ':' + str_pad_left(seconds, '0', 2);
    return finalTime
}

function str_pad_left(string, pad, length) {
    return (new Array(length + 1).join(pad) + string).slice(-length);
}



// [Info Embed]
const infoEmbed = function (info) {
    console.log("Building info embed:")
    if (info.description.length >= 500) {
        desc = info.description = info.description.substr(1, 500) + " ...."
    } else {
        desc = info.description
    }


    let randomColor = getRandomColor();
    let embed = new Discord.MessageEmbed()
        .setColor(randomColor)
        .setTitle(info.title)
        .setDescription("Published on " + info.published + "\n\n" + desc)
        .setURL(info.video_url)
        .addFields({
            name: 'length',
            value: calculateTime(info.videoDetails.lengthSeconds),
            inline: true

        }, {
            name: 'rating',
            value: info.likes + " likes | " + info.dislikes + " dislikes",
            inline: true
        })
        .setFooter("Music POWERED by Youtube", NappyN_image)

        if(info.videoDetails.thumbnail.thumbnails){
            embed.setThumbnail(info.videoDetails.thumbnail.thumbnails[info.videoDetails.thumbnail.thumbnails.length-1].url)
        } else if(info.videoDetails.thumbnail && !info.videoDetails.thumbnails) {
            embed.setThumbnail(info.videoDetails.thumbnail.url)
        }

    return embed

}
// [Info Embed]
const playlistInfoEmbed = function (playlistInfo) {
    console.log("building playlist info embed...")
    return new Discord.MessageEmbed()
        .setTitle("You are listening to:")
        .setDescription(playlistInfo)
}

const playlistEmbed = function (BroadcastData) {
    console.log("Building the playlist embed...")
    let randomColor = getRandomColor();
    

   let playlistName = BroadcastData.PlaylistName.replace(/_/g, " ")

    return new Discord.MessageEmbed()
        .setColor(randomColor)
        .setAuthor(`You are listening to ${playlistName}`)
        .setTitle(`See ${BroadcastData.track.artist} on Napster`)
        .setURL(`https://us.napster.com/artist/${BroadcastData.track.napsterArtistId}`)
        .setImage(`https://direct.rhapsody.com/imageserver/images/${BroadcastData.track.napsterArtistId}/356x237.jpg`)
        .addFields({
            name: "Artist:",
            value: BroadcastData.track.artist,
            inline: true
        }, {
            name: "Song:",
            value: BroadcastData.track.songName,
            inline: true
        },{
            name: "\u200B",
            value:"You can use the `!more` command to get more info about the current track."
        })
        .setFooter('Playlists POWERED by Napster')
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


module.exports = {
    helpEmbed,
    buildEmbed,
    infoEmbed,
    playlistInfoEmbed,
    devEmbed,
    playlistEmbed
}


/*
videoDetails: {
      videoId: 'aRGzlvOuigc',
      title: 'Wale - My PYT [OFFICIAL MUSIC VIDEO]',
      lengthSeconds: '255',
      keywords: [Array],
      channelId: 'UCN5dSZVxZtDULZ-ogtbEh4Q',
      isOwnerViewing: false,
      shortDescription: "Get Wale's new single My PYT, available everywhere now.\n" +
        '\n' +
        'Buy: http://smarturl.it/BuyPYT\n' +
        'Stream: http://smarturl.it/StreamPYT\n' +
        '\n' +
        "Keep up with Wale's PYT's here: http://walespyt.tumblr.com/\n" +
        '\n' +
        'Follow Wale\n' +
        '\n' +
        'http://www.facebook.com/waleofficial\n' +
        'http://twitter.com/wale\n' +
        'http://Instagram.com/Wale\n' +
        'http://soundcloud.com/ralphfolarin\n' +
        'https://open.spotify.com/artist/67nwj3Y5sZQLl72VNUHEYE\n' +
        'http://www.walemusic.com/',
      isCrawlable: true,
      thumbnail: [Object],
      useCipher: true,
      averageRating: 4.6998591,
      allowRatings: true,
      viewCount: '48587565',
      author: 'Wale',
      isPrivate: false,
      isUnpluggedCorpus: false,
      isLiveContent: false

      */