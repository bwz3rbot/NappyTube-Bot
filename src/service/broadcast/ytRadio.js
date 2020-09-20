// const
//     yt = require('ytdl-core'),
//     embed = require('../../common/embed'),
//     vote = require('./vote'),
//     ytSearch = require('../search/youtube'),
//     colors = require('colors'),
//     napster = require('../search/napster')


// // [Init The Radio]
// let client;
// let broadcast;
// let topTracksList
// let range;
// const initRadio = function (_client, _topTracksList) {
//     console.log("initializing the radio...".yellow)
//     client = _client
//     broadcast = client.voice.createBroadcast();
//     range = {
//         from: 0,
//         to: _topTracksList.size
//     }
//     topTracksList = _topTracksList
//     firstSearch = topTracksList.get(0)
//     query = firstSearch.artist + " " + firstSearch.name
//     ytSearch.search(query, streamFromUrl)

// }

// let dispatcher_top200
// const initDispatchers = function(_client,_playLists){

// }




// // [Stream From Url]
// let ytStream;
// let currentURL;
// let dispatcher;
// let count = 0;
// async function streamFromUrl(url = 'https://youtu.be/kwu2kVJ0LKE') {
//     whatsPlaying(url);
//     console.log("Streaming from: ".magenta, url.green)
//     currentURL = url

//     // Create the stream
//     ytStream = await yt(url, {
//         maxRedirects: 100,
//         maxRetries: 10,
//         maxReconnects: 10,
//         retryOnAuthError: true,
//         highWatermark: 1 << 25
//     })

//     dispatcher = broadcast.play(ytStream)
//     // Play the next song when finished with one.
//     dispatcher.on('finish', () => {
//         console.log("Playing Next.")
//         if (vote.votes.length > 0) {
//             voteChangeChannel()
//         } else {
//             console.log("Dispatcher emitted finish. searching youtube...")
//             count <= topTracksList.size ? count++ : count = 0
//             track = topTracksList.get(count)
//             console.log(track)
//             query = track.artist + " " + track.name
//             ytSearch.search(query, streamFromUrl)

//         }

//     });
// }

// // [Play Next]
// async function playNext() {
//     dispatcher.emit('finish')
// }
// // [Get Next URL]
// async function getNextURL() {
//     const info = await yt.getBasicInfo(currentURL)
//     // Generate a new url off the previous one.
//     id = info.related_videos[0].id
//     console.log("Playing next url: ", id)
//     return 'https://youtu.be/' + id
// }

// // [Info]
// async function info(msg) {

//     info = await yt.getBasicInfo(currentURL)
//     videoInfo = {}

//     videoInfo.author = info.author,
//         videoInfo.title = info.title,
//         videoInfo.description = info.description,
//         videoInfo.length = info.length_seconds,
//         videoInfo.published = info.published,
//         videoInfo.video_url = info.video_url,
//         videoInfo.likes = info.likes,
//         videoInfo.dislikes = info.dislikes,
//         videoInfo.ID = info.video_id

//     videoInfoEmbed = embed.infoEmbed(videoInfo)
//     msg.channel.send(videoInfoEmbed)
// }




// // [Listen]
// const connections = new Map
// const textChannels = new Map
// async function listen(msg) {
//     voiceChannel = msg.member.voice.channel
//     console.log(`Joining channel: (${voiceChannel.name}) on server (${msg.guild.name})...`)
//     connection = await voiceChannel.join()
//     voiceChannel.leave
//     connections.set(msg.member.voice.channel, connection)
//     textChannels.set(msg.channel.id, msg.channel.id)
//     console.log("Playing the broadcast")
//     connection.play(broadcast)
// }

// // [Leave]
// const leave = function (msg) {
//     msg.member.voice.channel.leave()
//     connections.delete(msg.member.voice.channel)
// }


// // [What's Playing]
// const whatsPlaying = function (url) {
//     textChannels.forEach((channel) => {
//         client.channels.cache.get(channel).send("Now playing: " + url)
//     })
// }

// // [Vote]
// const voteChangeChannel = function () {
//     console.log("CHANGING THE CHANNEL".yellow)
//     nextVote = vote.countVotes()
//     console.log("NEXT VOTE: ".green, nextVote)
//     console.log("SEARCHING YOUTUBE...")
//     ytSearch.search(nextVote, streamFromUrl)
// }

// const next = function () {
//     dispatcher.emit('finish')
// }

// module.exports = {
//     initRadio,
//     streamFromUrl,
//     ytStream,
//     listen,
//     playNext,
//     leave,
//     info,
//     voteChangeChannel,
//     next
// }