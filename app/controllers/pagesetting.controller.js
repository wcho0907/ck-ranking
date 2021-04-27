const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const async = require('async');
// If modifying these scopes, delete credentials.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
//const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';
const COIN_PATH = './coin/';

var respon;

exports.cnconfig = (req, res) => {
    respon = res;
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), readSheets);
    });
}

/**
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function readSheets(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    
    var start = new Date();
    async.parallel([
        function (callback) {
            sheets.spreadsheets.values.get({
                spreadsheetId: '1hw7KXFjdWfbtkZZ_aGXDXU753t9Ui53kFlmWhtrsRuo',
                range: 'Sheet1'
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const rows = res.data.values;
                console.log("meta rows: " + (parseInt(rows.length) - 1));
                callback(false, rows);
            });
        },
        function (callback) {
            sheets.spreadsheets.values.get({
                spreadsheetId: '1hw7KXFjdWfbtkZZ_aGXDXU753t9Ui53kFlmWhtrsRuo',
                range: 'Sheet2'
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const rows = res.data.values;
                console.log("data rows: " + (parseInt(rows.length) - 1));
                callback(false, rows);
            });
        }
        ],
        //Collate results
        function (err, results) {
            // 1. Get two sheets(meta, data) from googlesheets
            if (err) {
                respon.send(500, 'Server Error');
                console.log(err);
                return;
            }
            var returnObj = {};

            // 2. 
            var sheetRows = results[0];
            var basicPart = {};
            var priTabPart = {};
            var detailPart = [];
            var criteriaObj = {};
            var partNow = "";
            var partCount = 0;
            var priTabNow = "";
            sheetRows.map((row) => {
                var row0 = row[0] ? row[0].trim() : "";
                
                if(row0==="基本資料"){
                    partNow = "基本資料";
                    partCount = 0;
                }
                else if(row0.startsWith('頁籤資料')){
                    partNow = "頁籤資料";
                    partCount = -1;
                }
                else if(row0.startsWith('頁籤內容')){
                    partNow = "頁籤內容";
                    partCount = -1;
                }
                else{
                    if(partNow ==="基本資料"){
                        if(row[0]) basicPart[row[0].replace(/ *\([^)]*\) */g, "")] = row[1]; 
                    }
                    else if(partNow ==="頁籤資料"){
                        if(row[0]){
                            // Remove contrl characters from string (/b baclspace)
                            var thisPriTab = row[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
                            console.log("thisTab: " + thisPriTab);
                            if(thisPriTab.indexOf("tab")>= 0){
                                priTabNow = thisPriTab;
                                var priNode = { name : row[1], secTabPart : { [row[2]] : row[3]}}
                                priTabPart[priTabNow] = priNode;
                            }
                        }
                        else{
                            if(row[2]){
                               priTabPart[priTabNow]["secTabPart"][row[2]] =  row[3];
                            }
                        }
                    }
                }
                console.log(partNow + "-" + priTabNow + ">" + row[0] + " - " + row[1] + " - " + row[2] + " - " + row[3]);
            });

            
            var dataRows = results[1];
            // var coinData = [];
            // var outputCoins = [];
            // var dataTitle, dataTitleLen;
            // // 3. Build output data by coin
            // dataRows.map((row) => {
            //     var row0 = row[0];
            //     if(row0==="coin"){
            //         dataTitle = row;
            //         dataTitleLen = dataTitle.length;
            //     }
            //     else{
            //         // 1. Form coinSheetObj <-- contains all criteria from the data sheet
            //         var coinSheetObj = {};
            //         var score = 0;
                    
            //         for (var i = 0; i < dataTitleLen; i++) {
            //             coinSheetObj[dataTitle[i].trim()] = row[i] ? row[i].trim() : "";
            //         }

            //         // 2. Traverse ordered and valid criteria of meta sheet to reform obj
            //         var coinValidObj = {};
            //         coinValidObj["id"] = row0;
            //         outputCoins.push(row0);
            //         for (var prop in validCriteria) {
            //             coinValidObj[prop] = coinSheetObj[prop];
            //             if(scoreCriteria[prop]==="Y"){
            //                 coinValidObj[prop + "_v"] = coinSheetObj[prop + "_v"];
            //                 score += parseFloat(coinSheetObj[prop + "_v"]);
            //             }
            //             //console.log("##" + prop);
            //         }
            //         coinValidObj["score"] = score.toString().trim();
            //         coinData.push(coinValidObj);
            //     }
            // });

            function compare(a,b) {
                if (parseFloat(a.score) < parseFloat(b.score))
                  return 1;
                if (parseFloat(a.score) > parseFloat(b.score))
                  return -1;
                return 0;
            }
            //coinData.sort(compare);

            var metaCoins = {};

            returnObj["Sheet1"] = {"basicPart": basicPart, "priTabPart": priTabPart, "detailPart": detailPart};
            //returnObj["Sheet2"] = dataRows;
            respon.send(returnObj);

            var end = new Date() - start;
            console.log("Execution time: ", end);
            return;
        }
    );
}

function getCoinmeta(theCoins){

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