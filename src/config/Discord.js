// Require the one and only new Discord.Client()
const
    c = require('colors'),
    dateFormat = require('dateformat'),
    // channels = require('./channel/_channel-list').channels,
    channels = require('../service/channel/_channel-list').channels,
    Discord = require('discord.js'),
    client = new Discord.Client({
        // Set Presence
        presence: {
            activity: {
                type: 'LISTENING',
                name: 'all your favorite music!'
            },
            status: 'online'
        },
        // Retry Limit
        retryLimit: 3
    }),
    BroadcastManager = require('../service/broadcast/BroadcastManager');
//[Init]
// Init The Discord Client, Then Begin Broadcasting
async function init() {

    // Login with TOKEN
    console.log("|| DISCORD || client login...".bgWhite.black)
    await client.login(process.env.TOKEN)
    client.user.setUsername("NappyTube")
    client.on('error', (err) => {
        console.log(err)
    })
    client.on('rateLimit', (err) => {
        console.log(err)
    })
    // [On Ready]
    client.on("ready", async () => {
        guilds = client.guilds.cache
        guildList = []
        guilds.forEach(guild => {
            guildList.push(guild.name)
        })
        console.log("|| DISCORD ||connected to guilds: ".bgWhite.black, guildList)

        dateTime = dateFormat(new Date())
        console.log(`Successfully Connected as ${client.user.tag} | ${dateTime}`.green)
        // Login Success!
        console.log("|| DISCORD || requiring the broadcast manager.".bgWhite.black)

        console.log("|| DISCORD || awaiting BroadcastManager.initBroacasts...".bgWhite.black)
        await BroadcastManager.initBroadcasts(client);


        // TODO: Not sure if it will ever get here, but try?
        // If the client won't receive requestss, just do this before awaiting initBroadcasts

        // On Message Listener
        console.log("|| DISCORD || adding on message listener...".bgWhite.black)
        client.on('message', async (msg) => {
            if (!msg.author.bot) {
                // Runs down the list of channels
                channels.forEach(async (channel) => {
                    // Runs code for correct channel
                    await channel.on(msg, client);
                })
            }
        })
    })
}

// Call init.
init();