/*
Joseph P. Pasaoa
Habitats Route | Under the Seas App | Unit3 Assessment
*/


/* HELPERS */
const { log, db, commError } = require('../helpers.js');

/* MODULE INITS */
const express = require('express');
  const router = express.Router();


/* ROUTES */
router.get('/', getHabitats);
router.get('/:id', checkInputContent, getHabitats);
router.post('/', checkInputsExist, checkInputContent, preventDupe, addHabitat);


/* PRELIM MIDDLEWARE */
function checkInputsExist (req, res, next) { // checks only for complete body data
  if (!req.body.category) {
    res.status(404);
    res.json({
        status: "error",
        message: `missing category. Please check your inputs and try again.`,
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
        case "category":
          if (!str || str.length > 54) {
            problems.push("name too long (54 chars max) or missing");
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

async function preventDupe (req, res, next) {
  let response = null;
  let preventQuery = `
    SELECT category
    FROM habitats
  `;
  try {
    response = await db.any(preventQuery);
  } catch (error) {
    commError(req, res, error, "preventDupe");
  }
  const habitats = response;
  let isDuplicate = false;
  for (let habitat of habitats) {
    if (req.body.category.trim().toLowerCase() === habitat.category.toLowerCase()) {
      isDuplicate = true;
    }
  }
  if (isDuplicate) {
    res.status(404);
    res.json({
        status: "error",
        message: "habitat already exists",
        payload: null
    });
  } else {
    next();
  }
}


/* FINAL MIDDLEWARES */
async function addHabitat (req, res, next) {
  let response = null;
  let insertQuery = `
    INSERT INTO habitats (category) VALUES
      ($/category/)
      RETURNING *
  `;
  let insertArgs = {
    category: req.body.category.trim()
  };
  try {
    response = await db.one(insertQuery, insertArgs);
  } catch (error) {
    commError(req, res, error, "addHabitat");
  }
  res.status(201);
  res.json({
      status: "success",
      message: "new habitat added",
      payload: response
  });
}

async function getHabitats (req, res, next) {
  let response = null;
  let getQuery = `
    SELECT *
    FROM habitats
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
    commError(req, res, error, "getHabitat");
  }
  if (!response.length) {
    res.status(404);
    res.json({
        status: "error",
        message: "no habitats found",
        payload: null
    });
  } else {
    res.json({
        status: "success",
        message: response.length > 1 ? "habitats found" : "habitat found",
        payload: response.length > 1 ? response : response[0]
    });
  }
}


module.exports = router;
