//// Dispatcher Manager


// Create Dispatchers
let DispatchersMap = new Map
async function createDispatchers(playlists, client) {
    console.log("iterating over these playlists", playlists)


    console.log("number of playlists:", playlists.size)
    console.log("Dispatcher Manager || Creating Disptachers...".yellow)

    for (i = 0; i < playlists.size; i++) {
        console.log("Creating a new dispatcher...".yellow)
        dispatcher = await client.voice.createBroadcast()
        console.log("getting the playlist...")
        playlist = playlists.get(i)
        console.log("the playlist"+playlist)
        DispatchersMap.set(playlist.name,dispatcher)
    }


    console.log(`Created ${playlists.size} Dispatchers: `, DispatchersMap)



}


module.exports.createDispatchers = createDispatchers;