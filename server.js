'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');

// Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());

// routes
app.get('/location', handelLocationRequest);
// app.get('/weather', handelWeatherRequest);



function handelLocationRequest(req, res) {

  const searchQuery = req.query;
  console.log(searchQuery);

  const locationsRawData = require('./data/location.json');
  const location = new Location(locationsRawData[0])
  res.send(location);
}

// constructors

function Location(data) {
  this.latitude = data.lat;
  this.longitude = data.lon;
}
// to check if the server listen 
app.listen(PORT, () => console.log(`Listening to Port`));

