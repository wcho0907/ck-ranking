const express = require('express');
const bodyParser = require('body-parser');

// create express app
const app = express();

const port = 443;

// parse requests of content-type - application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
//app.use(bodyParser.json())
app.disable('etag');
// Configuring the database

// define a simple route
app.get('/', (req, res) => {
    res.json({"message": "This is Coin Information API Service. Please specify the path of the API."});
});


// Require Notes routes
require('./app/routes/app.routes.js')(app);

// listen for requests
app.listen(port, () => {
    console.log("Server is listening on port " + port);
});

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

