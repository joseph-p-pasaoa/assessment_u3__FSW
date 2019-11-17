/*
Joseph P. Pasaoa
Researchers Route | Under the Seas App | Unit3 Assessment
*/


/* HELPERS */
const { log, db, commError } = require('../helpers.js');

/* MODULE INITS */
const express = require('express');
  const router = express.Router();


/* MODELS
const Researcher = require('../models/Researcher.js');
*/

/*
POST : Add new researcher.
PATCH /:id: Update single researcher.
DELETE /:id: Delete single researcher.
*/


/* ROUTES */
router.get('/', getResearchers);
router.get('/:id', checkInputContent, getResearchers);
router.post('/', checkInputsExist, checkInputContent, preventDupe, addResearcher); // MADE CHECK BUT I'M ALLOWING DUPE NAMES
router.patch('/:id', checkInputsExist, checkIdExists, checkInputContent, patchResearcher);


/* MIDDLEWARE */
async function checkIdExists (req, res, next) {
  let isIdGood = false;
  if (req.params.id) {
    if (!isNaN(parseInt(req.params.id.trim()))) {
      let response = null;  
      let existQuery = `
        SELECT EXISTS (
          SELECT id
          FROM researchers
          WHERE id = $/id/
        )
      `;
      const existArg = { id: req.params.id.trim() };
      try {
        response = await db.any(existQuery, existArg);
      } catch (error) {
        commError(req, res, error, "preventDupe");
      }
      if (response[0].exists) {
        isIdGood = true;
      }
    }
  }
  if (!isIdGood) {
    res.json({
        status: "fail",
        message: "error: cannot find target researcher. please check input and try again"
    });
  } else {
    next();
  }
}

function checkInputsExist (req, res, next) { // checks only for complete body data
  let missing = [];
  if (!req.body.r_name) {
    missing.push("name");
  }
  if (!req.body.job_title) {
    missing.push("job title");
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
        status: "fail",
        message: `error: missing ${missing}. Please check your inputs and try again.`
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
        case "r_name":
          if (!str || str.length > 36) {
            problems.push("name too long (36 chars max) or missing");
          };
          break;
        case "job_title":
          if (!str || str.length > 54) {
            problems.push("job title too long (54 chars max) or missing");
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
        status: "fail",
        message: `error: ${problems}. Please check your inputs and try again.`
    });
  } else {
    next();
  }
}

async function preventDupe (req, res, next) {
  let response = null;
  let preventQuery = `
    SELECT name
    FROM researchers
  `;
  try {
    response = await db.any(preventQuery);
  } catch (error) {
    commError(req, res, error, "preventDupe");
  }
  const researchers = response;
  let isDuplicate = false;
  for (let researcher of researchers) {
    if (req.body.r_name.trim().toLowerCase() === researcher.name.toLowerCase()) {
      isDuplicate = true;
    }
  }
  if (isDuplicate) {
    res.json({
        status: "fail",
        message: "researcher already exists"
    });
  } else {
    next();
  }
}

async function addResearcher (req, res, next) {
  let response = null;
  let insertQuery = `
    INSERT INTO researchers (name, job_title) VALUES
      ($/name/, $/job_title/)
      RETURNING *
  `;
  let insertArgs = {
    name: req.body.r_name.trim(),
    job_title: req.body.job_title.trim()
  };
  try {
    response = await db.one(insertQuery, insertArgs);
  } catch (error) {
    commError(req, res, error, "addResearcher");
  }
  res.json({
      status: "success",
      message: "new researcher added",
      payload: response
  });
}

async function patchResearcher (req, res, next) {
  let response = null;
  let patchQuery = `
    UPDATE researchers 
    SET name = $/name/
      , job_title = $/job_title/ 
    WHERE id = $/id/ 
    RETURNING *
  `;
  let patchArgs = {
    id: Number(req.params.id.trim()),
    name: req.body.r_name.trim(),
    job_title: req.body.job_title.trim()
  }
  try {
    response = await db.one(patchQuery, patchArgs);
  } catch (error) {
    commError(req, res, error, "patchResearcher");
  }
  res.json({
      status: "success",
      message: "researcher record edited",
      payload: response
  });
}

async function getResearchers (req, res, next) {
  let response = null;
  let getQuery = `
    SELECT *
    FROM researchers
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
    commError(req, res, error, "getResearcher");
  }

  if (!response.length) {
    res.json({
        status: "fail",
        message: "no researchers found"
    });
  } else {
    res.json({
        status: "success",
        message: "researchers found",
        payload: response
    });
  }
}


module.exports = router;
