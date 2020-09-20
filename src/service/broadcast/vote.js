// Take votes on the next url to play from.

let votes = []
const castVote = function (args, msg) {
    args = args.toString()
    args = args.replace(/,/g, ' ')
    votes.push(args)
    msg.channel.send("You voted: "+ args)
}


const countVotes = function () {
    rand = Math.floor(Math.random() * (votes.length -0) + 1)
    console.log("Random number: ", rand)
    console.log(votes)
    chosenVote = votes[rand-1]
    votes = []
    return chosenVote
}

module.exports = {
    castVote,
    countVotes,
    votes
}