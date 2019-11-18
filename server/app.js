/*
Joseph P. Pasaoa
Server MAIN App.Js || Under the Seas App || Unit3 Assessment
*/


/* HELPERS INIT (including pgp) */
const { log, db } = require('./helpers.js');


/* MODULE INITS */
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 11000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));


/* ROUTING */
    // Imports
const researchersRT = require('./routes/researchers.js');
const speciesRT = require('./routes/species.js');
const animalsRT = require('./routes/animals.js');
const habitatsRT = require('./routes/habitats.js');
const sightingsRT = require('./routes/sightings.js');
    // Connects
app.use('/researchers', researchersRT);
app.use('/species', speciesRT);
app.use('/animals', animalsRT);
app.use('/habitats', habitatsRT);
app.use('/sightings', sightingsRT);


/* SERVER INIT */
app.listen(PORT, () => {
    log(`JoeyServer is now listening and serving on port ${PORT}. Carpe diem, zug zug.`);
});


/* ERROR HANDLING */
    // clientside
app.use("*", (req, res) => {
    res.status(404).json({
        payload: 'error: no such route found on this JoeyServer. try again.',
        err: true
    });
});
    // serverside
app.use(function (err, req, res, next) {
    console.log(err)
    res.status(err.status || 500);
    res.json({
        payload: {
          err: err,
          errStack: err.stack
        },
        err: true
    });
});
