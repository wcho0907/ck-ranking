//===========================================================================
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete credentials.json.
//const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';
//===========================================================================
var respon;
exports.rankAll = (req, res) => {
    respon = res;
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), listMajors);
    });
}


/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: '1FYy9kGtTzu7OgkJY-R6v89FOxt_99Cj09aQ8WWBgO54',
    range: 'Sheet1'
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    console.log("rows: " + rows.length);
    respon.send(rows);
    //respon.send("[ ['Void', 'Canvas', 'Website']");
    if (rows.length) {
      console.log('Name, Major:');
      // Print columns A and E, which correspond to indices 0 and 4.
      rows.map((row) => {
        console.log(`${row[0]}, ${row[1]}, ${row[2]}, ${row[3]}, ${row[4]}, ${row[5]}, ${row[6]}, ${row[7]}, ${row[8]}, ${row[9]}`);
      });
      
    } else {
      console.log('No data found.');
    }
  });
    // var body = {
    //     values: [ ["Void", "Canvas", "Website"]],
    //     valueInputOption: "USER_ENTERED"
    // };

    // sheets.spreadsheets.values.append({
    // auth: auth,
    // spreadsheetId: '1mRb2dSKCxdIY1ZH61UM5BfJDoYTTiMA3i30vHSuMet4',
    // range: 'Sheet1!A2:B', //Change Sheet1 if your worksheet's name is something else
    // valueInputOption: "USER_ENTERED",
    // resource: {
    //     values: [ ["Void", "Canvas", "Website"], ["Paul", "Shan", "Human"] ]
    // }
    // }, (err, response) => {
    // if (err) {
    //     console.log('The API returned an error: ' + err);
    //     return;
    // } else {
    //     console.log("Appended");
    // }
    // });

    // var data = sheets.spreadsheets.values.get("1mRb2dSKCxdIY1ZH61UM5BfJDoYTTiMA3i30vHSuMet4","Sheet1"); 
    // // returned value list[][]
    // var arr = data.values;
  
    // // last row with data
    // var rows = arr.length;
    // console.log("rows: " + rows);
    // // last column with data
    // var cols = arr.reduce(function(accumulator, el, i) {
    //   if (i == 1) { accumulator = accumulator.length } 
    //   cposole("cols: " + Math.max(accumulator, el.length));
    // });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }
  
  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return callback(err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }