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
app.get('/weather', handelWeatherRequest);



function handelLocationRequest(req, res) {

  const searchQuery = req.query.city;
  //   console.log(searchQuery);

  const locationsRawData = require('./data/location.json');
  const location = new Location(locationsRawData[0],searchQuery);
  res.send(location);
}


function handelWeatherRequest(req,res){
  const weatherRawData = require('./data/weather.json');
  const dateOfWeather=[];
  weatherRawData.forEach(weather=>{
    dateOfWeather.push(new Weather(weather));
  });
  res.send(dateOfWeather);

}
// constructors

function Location(data,query) {
  this.search_query=query;
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}
function Weather(data){
  this.time=data.valid_date;
  this.forecast=`${data.weather.description}in the morning`;
}
// to check if the server listen
//go to the terminal and write the command node server.js
app.listen(PORT, () => console.log(`Listening to Port`));

