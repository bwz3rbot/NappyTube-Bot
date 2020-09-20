// On Message Listener
const
    client = require('../config/Discord').client,
    channels = require('./channel/_channel-list').channels

client.on('message', (msg) => {
   if (!msg.author.bot) {
        // Runs down the list of channels
        channels.forEach((channel) => {
            // Runs code for correct channel
            channel.on(msg, client);
        })
    }
})
