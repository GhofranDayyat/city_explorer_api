'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent=require('superagent');
// const { query } = require('express');
const pg = require('pg');
// Application Setup
const PORT = process.env.PORT;
const GEO_CODE_API_KEY = process.env.GEO_CODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const PARK_CODE_API_KEY = process.env.PARK_CODE_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const app = express();
app.use(cors());

// Database Connection Setup
const client = new pg.Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


// routes
app.get('/location', handelLocationRequest);
app.get('/weather', handelWeatherRequest);
app.get('/park',handelParkRequest);
app.get('/',(request)=>{request.status(200).send('ok');});



//functions
function handelLocationRequest(req, res) {
  const searchQuery = req.query.city;

  if(!searchQuery){
    res.status(404).send('no city, was found');
  }
  locationData(searchQuery).then(data=>{
    res.status(200).json(data);
  }).catch(error=>{
    console.log(error);
    res.status(500).send('Soryr , something went wrong');
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



// Add locations
function locationData (citySearch) {

  console.log('go to the locationData function');
  const safeValues = [citySearch];
  const sqlQuery = `SELECT * FROM locations WHERE search_query =$1`;
  return client.query(sqlQuery,safeValues).then(result=>{
    if (result.rows.length!==0){
      //get the data from DB
      return result.rows[0];///rows not row
    }else{
      //get the data from the APT
      const url = `https://us1.locationiq.com/v1/search.php`;
      const cityQueryParam = {
        key: GEO_CODE_API_KEY,
        q: citySearch,
        format: 'json'
      };

      return superagent.get(url).query(cityQueryParam).then(data => {
        const location = new Location(citySearch, data.body[0]);
        const safeValues = [location.search_query,location.formatted_query, location.latitude, location.longitude];
        const sqlQuery = `INSERT INTO locations(search_query, formatted_query, latitude, longitude)VALUES($1, $2, $3, $4)`;
        client.query(sqlQuery,safeValues);
        return location;
      }).catch(error=>{
        console.log(error);

      });
    }
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
//or istall nodemon

function errormsg(req,res){
  res.status(500).send('Sorry, something went wrong');
}
app.use('*', errormsg);

// Connect to DB and Start the Web Server
client.connect().then(() => {
  app.listen(PORT, () => {
    console.log('Connected to database:', client.connectionParameters.database) ;//show what database we connected to
    console.log('Server up on', PORT);
  });
});



