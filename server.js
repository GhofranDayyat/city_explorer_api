'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
// const superagent=require('superagent');

// Application Setup
const PORT = process.env.PORT;
// const GEO_CODE_API_KEY = process.env.GEO_CODE_API_KEY;
const app = express();
app.use(cors());


// routes
app.get('/location', handelLocationRequest);
app.get('/weather', handelWeatherRequest);
// app.get()



function handelLocationRequest(req, res) {

  const searchQuery = req.query.city;
  if(!searchQuery){
    res.status(500).send('no city, was found');
  }
  const locationsRawData = require('./data/location.json');
  const location = new Location(locationsRawData[0],searchQuery);
  res.send(location);
}

function handelWeatherRequest(req,res){
  const dateOfWeather=[];
  let weatherRawData;
  try{

    weatherRawData = require('./data/weather.json');
    weatherRawData.data.map(weather=>{
      dateOfWeather.push(new Weather(weather));
    });
    res.send(dateOfWeather);
  }catch(error){
    res.status(500).send('internal server error occurred');
  }
}

// constructors

function Location(data,query) {
  this.search_query=query;
  this.formatted_query = data.display_name.toLowerCase();
  this.latitude = data.lat;
  this.longitude = data.lon;
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


