'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent=require('superagent');

// Application Setup
const PORT = process.env.PORT;
const GEO_CODE_API_KEY = process.env.GEO_CODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const app = express();
app.use(cors());


// routes
app.get('/location', handelLocationRequest);
app.get('/weather', handelWeatherRequest);
// app.get()


let latitude='' ;
let longitude='';
function handelLocationRequest(req, res) {
  const searchQuery = req.query.city;
  const cityQueryParam = {
    key: GEO_CODE_API_KEY,
    searchQuery: searchQuery,
    format: 'json'
  };
  const url = `https://us1.locationiq.com/v1/search.php?key=${GEO_CODE_API_KEY}&q=${searchQuery}&format=json`;

  if(!searchQuery){
    res.status(404).send('no city, was found');
  }
  superagent.get(url).query(cityQueryParam).then(data => {

    const location = new Location(searchQuery, data.body[0]);
    latitude=location.latitude;
    longitude-location.longitude;
    res.status(200).send(location);
  }).catch((error) => {
    console.log('ERROR', error);
    res.status(500).send('Sorry, something went wrong');
  });
}

function handelWeatherRequest(req,res){
  const weatherArr=[];

  const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${WEATHER_API_KEY}`;
  superagent.get(url).then(el => {
    el.body.data.map(e => {
      weatherArr.push(new Weather( e.body[0])) ;
    });
    res.status(200).send(weatherArr);
  }).catch((error) => {
    console.log('ERROR', error);
    res.status(500).send('Sorry, something went wrong in weather');
  });
}


// constructors

function Location(query,geoData) {
  this.search_query=query;
  this.formatted_query = geoData.display_name.toLowerCase();
  this.latitude = geoData.lat;
  this.longitude = geoData.lon;
}
function Weather(data){
  this.time=data.datetime;
  this.forecast=`${data.weather.description} in the morning`;
}
// to check if the server listen
//go to the terminal and write the command node server.js
app.listen(PORT,()=>
  console.log(`Listen to port ${PORT}`));

function errormsg(req,res){
  res.status(500).send('Sorry, something went wrong');
}
app.use('*', errormsg);


