const express = require('express');
require('dotenv').config({path: './.env'});
const app = express();
const cron = require('./src/cron/index.js');
var cors = require('cors')
const bodyParser = require("body-parser");

app.get('/', function(req, res) { 
  res.send("Test")
});

app.use(cors({
  "origin": "*",
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  "preflightContinue": false,
  "optionsSuccessStatus": 204
}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//cron.main(),

require('./src/routes/index')(app);

app.listen(3000, () =>
  console.log('Example app listening on port 3000!'),
);
