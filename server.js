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



const errorMsg={
  status: 500,
  responseText: 'Sorry, something went wrong',
};

function handelLocationRequest(req, res) {

  const searchQuery = req.query.city.toLowerCase();
  //   console.log(searchQuery);
  const matchWord=searchQuery.match(/lynnwood/g);

  if(matchWord){
    const locationsRawData = require('./data/location.json');
    const location = new Location(locationsRawData[0],searchQuery);
    res.send(location);
  }else{
    res.send(errorMsg);
  }
}

function handelWeatherRequest(req,res){
  const searchQuery = req.query.city.toLowerCase();
  const matchWord=searchQuery.match(/lynnwood/g);

  if (matchWord){

    const weatherRawData = require('./data/weather.json');
    const dateOfWeather=[];
    console.log(weatherRawData.data);
    weatherRawData.data.forEach(weather=>{
      dateOfWeather.push(new Weather(weather));
    });
    res.send(dateOfWeather);
  }else{
    res.send(errorMsg);
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
app.listen(PORT, () => console.log(`Listening to Port`));
// app.use('*', (req, res) => {
//   res.send('City Explorer!');
// });

