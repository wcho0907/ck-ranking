const express = require('express');
const bodyParser = require('body-parser');

// create express app
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

// Configuring the database
//const dbConfig = require('./config/database.config.js');

// define a simple route
app.get('/', (req, res) => {
    res.json({"message": "This is Coin Information API Service. Please specify the path of the API."});
});

// Require Notes routes
require('./app/routes/app.routes.js')(app);

// listen for requests
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});