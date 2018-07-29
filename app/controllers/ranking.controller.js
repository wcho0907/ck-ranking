const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const async = require('async');
// If modifying these scopes, delete credentials.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
//const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';

var respon;

exports.rankAll = (req, res) => {
    respon = res;
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), readSheets);
    });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function readSheets(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    
    var start = new Date();
    async.parallel([
        function (callback) {
            sheets.spreadsheets.values.get({
                spreadsheetId: '1FYy9kGtTzu7OgkJY-R6v89FOxt_99Cj09aQ8WWBgO54',
                range: 'Sheet1'
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const rows = res.data.values;
                console.log("meta rows: " + rows.length);
                callback(false, rows);
            });
        },
        function (callback) {
            sheets.spreadsheets.values.get({
                spreadsheetId: '1FYy9kGtTzu7OgkJY-R6v89FOxt_99Cj09aQ8WWBgO54',
                range: 'data'
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const rows = res.data.values;
                console.log("data rows: " + rows.length);
                callback(false, rows);
            });
        }
        ],
        //Collate results
        function (err, results) {
            if (err) {
                respon.send(500, 'Server Error');
                console.log(err);
                return;
            }
            var metaRows = results[0];
            var scoreCriteria = {};
            var validCriteria = {};
            metaRows.map((row) => {
                if(row[8]&&row[8].trim() === "Y"){
                    if(row[7]&&row[7].trim() === "Y"){
                        scoreCriteria[row[3].trim()] = "Y";
                    }
                    validCriteria[row[3].trim()] = "Y";
                }
            });
            console.log(scoreCriteria);
            console.log(validCriteria);
            
            var dataRows = results[1];
            var coins = [];
            var keyRow, keyLen;
            dataRows.map((row) => {
                if(row[0]==="coin"){
                    keyRow = row;
                    keyLen = keyRow.length
                }
                else{
                    // 1. Form coinSheetObj <-- contains all criteria from the data sheet
                    var coinSheetObj = {};
                    var score = 0;
                    
                    for (var i = 0; i < keyLen; i++) {
                        coinSheetObj[keyRow[i].trim()] = row[i] ? row[i].trim() : "";
                    }

                    // 2. Traverse ordered and valid criteria of meta sheet to reform obj
                    var coinValidObj = {};
                    for (var prop in validCriteria) {
                        coinValidObj[prop] = coinSheetObj[prop];
                        if(scoreCriteria[prop]==="Y"){
                            coinValidObj[prop + "_v"] = coinSheetObj[prop + "_v"];
                        }
                        console.log("##" + prop);
                    }
                    coins.push(coinValidObj);
                }
            });
            //respon.send(results);
            respon.send(coins);
            var end = new Date() - start;
            console.log("Execution time: ", end);
            return;
        }
    );
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

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