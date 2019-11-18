/*
Joseph P. Pasaoa
Sightings Route | Under the Seas App | Unit3 Assessment
*/


/* HELPERS */
const { log, db, commError } = require('../helpers.js');

/* MODULE INITS */
const express = require('express');
  const router = express.Router();


/*
GET /sightings: Get all sightings.
GET /sightings/species/:id: Get all sightings of a specific species.
GET /sightings/researchers/:id: Get all sightings for a specific researcher.
GET /sightings/habitats/:id: Get all sightings for a specific habitat.
POST /sightings: Add new sighting.
DELETE /sightings/:id: Delete single sighting.
*/

/* ROUTES */
router.get('/', getSightings);
// router.get('/:id', checkInputContent, getSightings);
// router.get('/:id', checkInputContent, getSightings);
// router.get('/:id', checkInputContent, getSightings);
// router.post('/', checkInputsExist, checkInputContent, addSighting);
// router.delete('/:id', checkIdExists, checkInputContent, delSighting);


/* PRELIM MIDDLEWARE */



/* FINAL MIDDLEWARES */
async function getSightings (req, res, next) {
  let response = null;
  let getQuery = `
    SELECT *
    FROM sightings
  `;
  let getArgs = null;
  if (req.params.id) {
    getQuery += ` WHERE id = $/id/`;
    getArgs = { id: parseInt(req.params.id.trim()) };
  }
  getQuery += ` ORDER BY id ASC`;
  try {
    response = await db.any(getQuery, getArgs);
  } catch (error) {
    commError(req, res, error, "getSighting");
  }
  if (!response.length) {
    res.status(404);
    res.json({
        status: "error",
        message: "no sightings found",
        payload: null
    });
  } else {
    res.json({
        status: "success",
        message: response.length > 1 ? "sightings found" : "sighting found",
        payload: response.length > 1 ? response : response[0]
    });
  }
}


module.exports = router;
