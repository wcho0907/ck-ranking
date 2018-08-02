exports.loadAll = (req, res) => {
    res.send({'test': 'test'});

    
    // respon = res;
    // fs.readFile('credentials.json', (err, content) => {
    //     if (err) return console.log('Error loading client secret file:', err);
    //     // Authorize a client with credentials, then call the Google Sheets API.
    //     authorize(JSON.parse(content), readSheets);
    // });
}