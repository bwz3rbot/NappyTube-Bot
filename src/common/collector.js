// Collector
// @todo:turn this into a class to be reused in many fun ways...
const play = function (msg) {
    console.log("PLAYING...")
    const filter = msg => msg.content.includes('discord')
    const collector = msg.channel.createMessageCollector(filter, {
        time: 15000

    })

    collector.on('collect', m => {
        console.log(`collected ${m.content}`)
    })

    collector.on('', )
    collector.on('end', collected => {
        console.log(`Collected ${collected.size} items`)
        console.dir(collected)
    })
}


exports.play = play;