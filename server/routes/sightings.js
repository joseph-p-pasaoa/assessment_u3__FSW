/*
Joseph P. Pasaoa
Sightings Route | Under the Seas App | Unit3 Assessment
*/


/* HELPERS */
const { log, db, commError } = require('../helpers.js');

/* MODULE INITS */
const express = require('express');
  const router = express.Router();


/* ROUTES */
router.get('/', getSightings);
router.get('/researchers/:id', checkInputContent, getSightings);
router.get('/species/:id', checkInputContent, getSightings);
router.get('/habitats/:id', checkInputContent, getSightings);
router.post('/', checkInputsExist, checkInputContent, checkIdsExist, addSighting);
router.delete('/:id', checkSightingIdExists, delSighting);


/* PRELIM MIDDLEWARE */
async function checkSightingIdExists (req, res, next) {
  let isIdGood = false;
  if (req.params.id) {
    if (!isNaN(parseInt(req.params.id.trim()))) {
      let response = null;  
      let existQuery = `
        SELECT EXISTS (
          SELECT id
          FROM sightings
          WHERE id = $/id/
        )
      `;
      const existArg = { id: parseInt(req.params.id.trim()) };
      try {
        response = await db.any(existQuery, existArg);
      } catch (error) {
        commError(req, res, error, "checkSightingIdExists");
      }
      if (response[0].exists) {
        isIdGood = true;
      }
    }
  }
  if (!isIdGood) {
    res.status(404);
    res.json({
        status: "error",
        message: "cannot find target sighting. please check input and try again",
        payload: null
    });
  } else {
    next();
  }
}

function checkInputsExist (req, res, next) { // checks only for complete body data
  let missing = [];
  if (!req.body.researcherId) {
    missing.push("researcher ID");
  }
  if (!req.body.speciesId) {
    missing.push("species ID");
  }
  if (!req.body.habitatId) {
    missing.push("habitat ID");
  }
  // COMPILE MESSAGE
  if (missing.length) {
    missing = missing.map(el => el.toUpperCase());
    if (missing.length >= 2) {
      missing[missing.length - 1] = "and " + missing[missing.length - 1];
      missing.length > 2
        ? missing = missing.join(', ')
        : missing = missing.join(' ');
    } else {
      missing = missing.join('');
    }
    res.status(404);
    res.json({
        status: "error",
        message: `missing ${missing}. Please check your inputs and try again.`,
        payload: null
    });
  } else {
    next();
  }
}

function checkInputContent (req, res, next) {
  let problems = [];
  // CHECK PARAMETER INPUTS
  if (req.params) {
    for (let key in req.params) {
      const str = req.params[key].trim();
      switch (key) {
        case "id":
          if (!str || isNaN(parseInt(str))) {
            problems.push("invalid id number");
          };
          break;
        default:
          break;
      }
    }
  }
  // CHECK BODY INPUTS
  if (req.body) {
    for (let key in req.body) {
      const str = req.body[key].trim();
      switch (key) {
        case "researcherId":
          if (!str || isNaN(parseInt(str))) {
            problems.push("invalid researcher id number");
          };
          break;
        case "speciesId":
          if (!str || isNaN(parseInt(str))) {
            problems.push("invalid species id number");
          };
          break;
        case "habitatId":
          if (!str || isNaN(parseInt(str))) {
            problems.push("invalid habitat id number");
          };
          break;
        default:
          break;
      }
    }
  }
  // COMPILE MESSAGE
  if (problems.length) {
    problems = problems.map(el => el.toUpperCase());
    if (problems.length >= 2) {
      problems[problems.length - 1] = "and " + problems[problems.length - 1];
      problems.length > 2
        ? problems = problems.join(', ')
        : problems = problems.join(' ');
    } else {
      problems = problems.join('');
    }
    res.status(404);
    res.json({
        status: "error",
        message: `${problems}. Please check your inputs and try again.`,
        payload: null
    });
  } else {
    next();
  }
}

async function checkIdsExist (req, res, next) {
  let response = null;
  let existQuery = `
    SELECT EXISTS (
        SELECT id
        FROM researchers
        WHERE id = $/researcher_id/
      ) AS researcher_Id
      , EXISTS (
        SELECT id
        FROM species
        WHERE id = $/species_id/
      ) AS species_Id
      , EXISTS (
        SELECT id
        FROM habitats
        WHERE id = $/habitat_id/
      ) AS habitat_Id
  `;
  const existArg = {
    researcher_id: parseInt(req.body.researcherId.trim()),
    species_id: parseInt(req.body.speciesId.trim()),
    habitat_id: parseInt(req.body.habitatId.trim())
  };
  try {
    response = await db.any(existQuery, existArg);
    log(response);
  } catch (error) {
    commError(req, res, error, "checkIdsExists");
  }
  let dontExist = [];
  for (let key in response[0]) {
    if (!response[0][key]) {
      dontExist.push(key);
    }
  }
  if (dontExist.length) {
    dontExist = dontExist.map(el => el.toUpperCase());
    if (dontExist.length >= 2) {
      dontExist[dontExist.length - 1] = "and " + dontExist[dontExist.length - 1];
      dontExist.length > 2
        ? dontExist = dontExist.join(', ')
        : dontExist = dontExist.join(' ');
    } else {
      dontExist = dontExist.join('');
    }
    res.status(404);
    res.json({
        status: "error",
        message: `inexistent ${dontExist}. please check inputs and try again`,
        payload: null
    });
  } else {
    next();
  }
}


/* FINAL MIDDLEWARES */
async function addSighting (req, res, next) {
  let response = null;
  let insertQuery = `
    INSERT INTO sightings (researcher_id, species_id, habitat_id) VALUES
      ($/researcher_id/, $/species_id/, $/habitat_id/)
      RETURNING *
  `;
  let insertArgs = {
    researcher_id: parseInt(req.body.researcherId.trim()),
    species_id: parseInt(req.body.speciesId.trim()),
    habitat_id: parseInt(req.body.habitatId.trim())
  };
  try {
    response = await db.one(insertQuery, insertArgs);
  } catch (error) {
    commError(req, res, error, "addSighting");
  }
  res.status(201);
  res.json({
      status: "success",
      message: "new sighting added",
      payload: response
  });
}

async function delSighting (req, res, next) {
  let response = null;
  let delQuery = `
    DELETE FROM sightings
    WHERE id = $/id/
    RETURNING *;
  `;
  const delArg = { id: parseInt(req.params.id.trim()) };
  try {
    response = await db.one(delQuery, delArg);
  } catch (error) {
    commError(req, res, error, "delSighting");
  }
  res.json({
      status: "success",
      message: "sighting has been deleted",
      payload: response
  });
}

async function getSightings (req, res, next) {
  let response = null;
  let getQuery = `
    SELECT sightings.id
      , researchers.name AS researcher
      , job_title AS r_title
      , species.name AS species
      , habitats.category AS habitat
    FROM sightings
    JOIN researchers ON (sightings.researcher_id = researchers.id)
    JOIN species ON (sightings.species_id = species.id)
    JOIN habitats ON (sightings.habitat_id = habitats.id)
  `;
  let getArgs = null;
  if (req.params.id) {
    getArgs = { id: parseInt(req.params.id.trim()) };
    if (req.path.includes("researchers")) {
      getQuery += ` WHERE researchers.id = $/id/`;
    }
    if (req.path.includes("species")) {
      getQuery += ` WHERE species.id = $/id/`;
    }
    if (req.path.includes("habitats")) {
      getQuery += ` WHERE habitats.id = $/id/`;
    }
  }
  getQuery += ` ORDER BY sightings.id ASC`;
  try {
    response = await db.any(getQuery, getArgs);
  } catch (error) {
    commError(req, res, error, "getSightings");
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
