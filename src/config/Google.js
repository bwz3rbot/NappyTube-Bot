const colors = require('colors')
var fs = require('fs');
var readline = require('readline');
var {
  google,
  Auth
} = require('googleapis');
var OAuth2 = google.auth.OAuth2;
console.log("Initiating login with google...".rainbow)

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
  process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';

const getAuth = (_callback) => fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: '.red + err);
    return;
  }
  console.log("Authorizing the client".green)
  // Authorize a client with the loaded credentials, then call the YouTube API.
  authorize(JSON.parse(content), _callback);
});



//////////
////////////
/// Promisified OAuth
const AuthenticatedSearch = function (args) {
  return new Promise((resolve, reject) => {
    getAuth((auth) => {
      searchYoutube(auth, args)
        .then((response, err) => {
          if (err) reject(err)
          else {
            resolve(response)
          }

        })
    })
  })

}
const AuthenticatedCategorySearch = function (args) {
  console.log("Making an authenticated request to youtube... args: ", args)
  return new Promise((resolve, reject) => {
    getAuth((auth) => {
      youtube_catagory_search(auth, args)
        .then((response, err) => {
          if (err) reject(err)
          else {
            resolve(response)
          }

        })
    })
  })

}

//////////
/////////////




/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
const authorize = function (credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
const getNewToken = function (oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function (code) {
    rl.close();
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
const storeToken = function(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
}

/**
 * Search YouTube with query params. Returns a list of youtube objects.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function searchYoutube(auth, args) {
  console.log("|| SEARCHING YOUTUBE || args: ".magenta, args)
  var youtube = google.youtube('v3');
  csv = args.toString()
  return youtube.search.list({
    auth: auth,
    "part": [
      "snippet"
    ],
    "maxResults": 25,
    "q": csv
  })
}
/**
 * Search YouTube with query params. Returns a list of youtube objects.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
const youtube_catagory_search = function (auth, args) {
  console.log("|| SEARCHING YOUTUBE for CATEGORY || args: ".magenta, args)
  console.log("AUTH: ", auth)
  var youtube = google.youtube('v3');
  csv = args.toString()
  return youtube.videoCategories.list({
    key: process.env.GOOGLE_API_KEY,
    regionCode: '10',
    "part": [
      "music"
    ]
  })
}

module.exports.AuthenticatedSearch = AuthenticatedSearch
module.exports.AuthenticatedCategorySearch = AuthenticatedCategorySearch