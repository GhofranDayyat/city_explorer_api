'use strict';

require('dotenv').config();

// Dependencies
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const cors = require('cors');

///
// install pg package
// setup url for database connections in .env
// connect the server with postgresql
//create endpoint that will take the users info and create a new user in the DB
//create an endpoint for retrieving all the user info

// Setup
const PORT = process.env.PORT || 3001;
// if the APIs are not working, delete any whitespaces in the .env file
const DATABASE_URL = process.env.DATABASE_URL;
const GEO_CODE_API_KEY = process.env.GEO_CODE_API_KEY;
const app = express();
app.use(cors());



// Endpoints
app.get('/location', handleLocationRequest);
app.use('*', handleErrorNotFound);

// Handle Functions

function handleLocationRequest(req, res) {
  const searchQuery = req.query.city;
  const url = `https://us1.locationiq.com/v1/search.php?key=${GEO_CODE_API_KEY}&city=${searchQuery}&format=json`;

  if (!searchQuery) { //for empty request
    res.status(404).send('no search query was provided');
  }

  const sqlQuery = `SELECT * FROM cities`;
  client.query(sqlQuery).then(result => {
    // console.log(result.rows[0].search_query);
    let sqlCheck = false;
    result.rows.forEach(entry => {
      if (entry.search_query === searchQuery) {
        sqlCheck = true;
        console.log('from db');
        res.status(200).send(entry);
      }
    });
    if (!sqlCheck) {
      console.log('new entry');
      superagent.get(url).then(resData => {
        const location = new Location(searchQuery, resData.body[0]);


        ////// Insert to table
        const safeValues = Object.values(location);
        const sqlQuery = `INSERT INTO cities(search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4)`;
        client.query(sqlQuery, safeValues).then(result => {
          res.status(200).json(result);
        }).catch(error => {
          console.log('error', error);
          res.status(500).send('internal server error');
        });

        res.status(200).send(location);
      }).catch((error) => {
        console.log('error', error);
        res.status(500).send('something went wrong');
      });
    }
  }).catch(error => {
    console.log('error', error);
    res.status(500).send('internal server error');
  });

}


// Constructors
function Location(searchQuery, data) {
  this.search_query = searchQuery; //taken from the request, and we add it as parameter as well
  this.formatted_query = data.display_name;
  this.latitude = data.lat;
  this.longitude = data.lon;
}

//////
function handleErrorNotFound(req, res) {
  res.status(404).send('Sorry, something went wrong');
}

client.connect().then(() => {
  app.listen(PORT, () => {
    console.log('connected to db', client.connectionParameters.database); //show what database we are connected to
    console.log(`Listening to Port ${PORT}`);
  });
});