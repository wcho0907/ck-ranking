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
            var detailPart = {};
            var partNow = "";
            var partCount = 0;
            var priTabNow = "";
            var modAttrs = [];
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
                        // 去括號及其內容
                        if(row[0]) basicPart[row[0].replace(/ *\([^)]*\) */g, "")] = row[1]; 
                    }
                    else if(partNow ==="頁籤資料"){
                        if(row[0]){
                            // Remove contrl characters from string (/b baclspace) 可能是合併儲存格造成
                            var thisPriTab = row[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
                            console.log("thisTab: " + thisPriTab);
                            if(thisPriTab.indexOf("tab")>= 0){
                                priTabNow = thisPriTab;
                                var priNode = { name : row[1], secTabPart : { [priTabNow + "_" + row[2]] : { name : row[3], module : {}}}}
                                priTabPart[priTabNow] = priNode;
                            }
                        }
                        else{
                            if(row[2]){
                                var secNode = { name : row[3], module : {}}
                                priTabPart[priTabNow]["secTabPart"][priTabNow + "_" + row[2]] = secNode;
                            }
                        }
                    }
                    else if(partNow ==="頁籤內容"){
                        if(row[0]){
                            var thisPriTab = row[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
                            // Get column name
                            if(row[0].startsWith("第一層")){
                                var row3 = row[3].replace(/ *\([^)]*\) */g, "").replace("*","");
                                var row4 = row[4].replace(/ *\([^)]*\) */g, "").replace("*","");
                                var row5 = row[5].replace(/ *\([^)]*\) */g, "").replace("*","");
                                var row6 = row[6].replace(/ *\([^)]*\) */g, "").replace("*","");
                                var row7 = row[7].replace(/ *\([^)]*\) */g, "").replace("*","");
                                modAttrs.push(row3);
                                modAttrs.push(row4);
                                modAttrs.push(row5);
                                modAttrs.push(row6);
                                modAttrs.push(row7);
                                console.log("kk"+ modAttrs[0] + "-" + modAttrs[1] + "-" + modAttrs[2] + "-" + modAttrs[3] + "-" + modAttrs[4]);
                            } else if(thisPriTab.indexOf("tab")>= 0){
                                // 去括號及其內容
                                var modTitle = row[2].replace(/ *\([^)]*\) */g, "");
                                //console.log("yes 2 >>" + row[1] + "<< >>" + modTitle + "<<");
                                priTabNow = thisPriTab;
                                var modData = {};
                                modData[modAttrs[0]] = row[3];
                                modData[modAttrs[1]] = row[4];
                                modData[modAttrs[2]] = row[5];
                                modData[modAttrs[3]] = row[6];
                                modData[modAttrs[4]] = row[7];
                                priTabPart[priTabNow]["secTabPart"][priTabNow + "_" + row[1]]["module"][modTitle] = modData;
                            }
                        }
                        else{

                            if(row[1]){
                                // 去括號及其內容
                                var modTitle = row[2].replace(/ *\([^)]*\) */g, "");
                                var modData = {};
                                modData[modAttrs[0]] = row[3];
                                modData[modAttrs[1]] = row[4];
                                modData[modAttrs[2]] = row[5];
                                modData[modAttrs[3]] = row[6];
                                modData[modAttrs[4]] = row[7];
                                priTabPart[priTabNow]["secTabPart"][priTabNow + "_" + row[1]]["module"][modTitle] = modData;
                            }
                        }
                    }
                }
                console.log(partNow + "-" + priTabNow + ">" + row[0] + " - " + row[1] + " - " + row[2] + " - " + row[3]);
            });
            
            var dataRows = results[1];

            function compare(a,b) {
                if (parseFloat(a.score) < parseFloat(b.score))
                  return 1;
                if (parseFloat(a.score) > parseFloat(b.score))
                  return -1;
                return 0;
            }
            //coinData.sort(compare);

            var metaCoins = {};

            returnObj["Sheet1"] = {"basicPart": basicPart, "priTabPart": priTabPart}; //, "detailPart": detailPart};
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