/*
Joseph P. Pasaoa
Species Route | Under the Seas App | Unit3 Assessment
*/


/* HELPERS */
const { log, db, commError } = require('../helpers.js');

/* MODULE INITS */
const express = require('express');
  const router = express.Router();


/* ROUTES */
router.get('/', getSpecies);
router.get('/:id', checkInputContent, getSpecies);
router.post('/', checkInputsExist, checkInputContent, preventDupe, addSpecies);


/* PRELIM MIDDLEWARE */
function checkInputsExist (req, res, next) { // checks only for complete body data
  let missing = [];
  if (!req.body.s_name) {
    missing.push("name");
  }
  if (!req.body.is_mammal) {
    missing.push("mammal status");
  }
  // COMPILE MESSAGE
  if (missing.length) {
    missing = missing.map(el => el.toUpperCase());
    if (missing.length >= 2) {
      missing[missing.length - 1] = "and " + missing[missing.length - 1];
      missing = missing.join(' ');
    } else {
      missing = missing.join('');
    }
    res.status(404);
    res.json({
        status: "error",
        message: `error: missing ${missing}. Please check your inputs and try again.`,
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
        case "s_name":
          if (!str || str.length > 54) {
            problems.push("name too long (54 chars max) or missing");
          };
          break;
        case "is_mammal":
          if (!str || typeof str === "boolean") {
            problems.push("mammal status is invalid");
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
        message: `error: ${problems}. Please check your inputs and try again.`,
        payload: null
    });
  } else {
    next();
  }
}

async function preventDupe (req, res, next) {
  let response = null;
  let preventQuery = `
    SELECT name
    FROM species
  `;
  try {
    response = await db.any(preventQuery);
  } catch (error) {
    commError(req, res, error, "preventDupe");
  }
  const species = response;
  let isDuplicate = false;
  for (let oneSpecies of species) {
    if (req.body.s_name.trim().toLowerCase() === oneSpecies.name.toLowerCase()) {
      isDuplicate = true;
    }
  }
  if (isDuplicate) {
    res.status(404);
    res.json({
        status: "error",
        message: "species name already exists",
        payload: null
    });
  } else {
    next();
  }
}


/* FINAL MIDDLEWARES */
async function addSpecies (req, res, next) {
  let response = null;
  let insertQuery = `
    INSERT INTO species (name, is_mammal) VALUES
      ($/name/, $/is_mammal/)
      RETURNING *
  `;
  let insertArgs = {
    name: req.body.s_name.trim(),
    is_mammal: req.body.is_mammal
  };
  try {
    response = await db.one(insertQuery, insertArgs);
  } catch (error) {
    commError(req, res, error, "addSpecies");
  }
  res.status(201);
  res.json({
      status: "success",
      message: "new species added",
      payload: response
  });
}

async function getSpecies (req, res, next) {
  let response = null;
  let getQuery = `
    SELECT *
    FROM species
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
    commError(req, res, error, "getSpecies");
  }
  if (!response.length) {
    res.json({
        status: "error",
        message: "no species found",
        payload: null
    });
  } else {
    res.json({
        status: "success",
        message: "species found",
        payload: response.length > 1 ? response : response[0]
    });
  }
}


module.exports = router;
