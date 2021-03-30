'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent=require('superagent');
// const { query } = require('express');

// Application Setup
const PORT = process.env.PORT;
const GEO_CODE_API_KEY = process.env.GEO_CODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const PARK_CODE_API_KEY = process.env.PARK_CODE_API_KEY;
const app = express();
app.use(cors());


// routes
app.get('/location', handelLocationRequest);
app.get('/weather', handelWeatherRequest);
app.get('/park',handelParkRequest);

function handelLocationRequest(req, res) {
  const searchQuery = req.query.city;
  const cityQueryParam = {
    key: GEO_CODE_API_KEY,
    searchQuery: searchQuery,
    format: 'json'
  };
  const url = `https://us1.locationiq.com/v1/search.php?q=${searchQuery}&key=${GEO_CODE_API_KEY}`;

  if(!searchQuery){
    res.status(404).send('no city, was found');
  }
  superagent.get(url).query(cityQueryParam).then(data => {

    const location = new Location(searchQuery, data.body[0]);
    res.status(200).send(location);
  }).catch((error) => {
    console.log('ERROR', error);
    res.status(500).send('Sorry, something went wrong');
  });
}

function handelWeatherRequest(req,res){
  const url = `https://api.weatherbit.io/v2.0/forecast/daily`;
  const queryObj={
    lat:req.query.latitude,
    lon:req.query.longitude,
    key:WEATHER_API_KEY
  };

  superagent.get(url).query(queryObj).then(el => {
    const weatherData = el.body.data.map(e=>{
      return new Weather(e);
    });
    res.send(weatherData);
  }).catch((error) => {
    console.error('ERROR', error);
    res.status(500).send('Sorry, something went wrong in weather');
  });
}

function handelParkRequest(req ,res){
  const url = `https://developer.nps.gov/api/v1/parks?q=${req.query.search_query}&api_key=${PARK_CODE_API_KEY}&limit=10`;
  superagent.get(url).then(e=>{
    const parkData = e.body.data.map(park=>{
      return new Park(park);
    });
    res.send(parkData);
  }).catch(error=>{
    console.error('ERROR',error);
    req.status(500).send('there is error in park req');
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
  this.forecast=data.weather.description;
  this.time=data.datetime;
}

function Park(data){
  this.name = data.name;
  this.description = data.description;
  this.address = `${data.addresses[0].line1} ,${data.addresses[0].city} , ${data.addresses[0].stateCode} , ${data.addresses[0].postalCode} `;
  this.fee = '0.00';
  this.park_url = data.url;
}
// to check if the server listen
//go to the terminal and write the command node server.js
app.listen(PORT,()=>
  console.log(`Listen to port ${PORT}`));

function errormsg(req,res){
  res.status(500).send('Sorry, something went wrong');
}
app.use('*', errormsg);


