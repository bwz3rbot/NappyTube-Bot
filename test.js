const ytdl = require('ytdl-core')

async function test() {
    let info = await ytdl.getBasicInfo('https://youtu.be/ZgU3UrZW1QE')
    // console.log(info)
console.log("info.videoDetails.thumbnail: ", info.videoDetails.thumbnail)

}



test()