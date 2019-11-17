/*
Joseph P. Pasaoa
Animals Route | Under the Seas App | Unit3 Assessment
*/


/* HELPERS */
const { log, db, commError } = require('../helpers.js');

/* MODULE INITS */
const express = require('express');
  const router = express.Router();


/*
GET /animals: Get all animals.
GET /animals/:id: Get single animal.
POST /animals: Add new animal.
PATCH /animals/:id: Update single animal.
DELETE /animals/:id: Delete single animal.
*/

/* ROUTES */
router.get('/', getAnimals);
router.get('/:id', checkInputContent, getAnimals);
router.post('/', checkInputsExist, checkInputContent, checkSpeciesIdExists, addAnimal); // I'M ALLOWING DUPE NAMES HERE, TOO
router.patch('/:id', checkInputsExist, checkIdExists, checkInputContent, checkSpeciesIdExists, patchAnimal);
router.delete('/:id', checkIdExists, checkInputContent, delAnimal);


/* PRELIM MIDDLEWARE */
function checkInputsExist (req, res, next) { // checks only for complete body data
  let missing = [];
  if (!req.body.species_id) {
    missing.push("species id");
  }
  if (!req.body.nickname) {
    missing.push("nickname");
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
        message: `missing ${missing}. Please check your inputs and try again.`,
        payload: null
    });
  } else {
    next();
  }
}

async function checkIdExists (req, res, next) {
  let isIdGood = false;
  if (req.params.id) {
    if (!isNaN(parseInt(req.params.id.trim()))) {
      let response = null;  
      let existQuery = `
        SELECT EXISTS (
          SELECT id
          FROM animals
          WHERE id = $/id/
        )
      `;
      const existArg = { id: req.params.id.trim() };
      try {
        response = await db.any(existQuery, existArg);
      } catch (error) {
        commError(req, res, error, "checkIdExists");
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
        message: "cannot find target animal. please check input and try again",
        payload: null
    });
  } else {
    next();
  }
}

async function checkSpeciesIdExists (req, res, next) {
  let isSpeciesIdGood = false;
  if (!isNaN(parseInt(req.body.species_id.trim()))) {
    let response = null;  
    let existQuery = `
      SELECT EXISTS (
        SELECT id
        FROM species
        WHERE id = $/id/
      )
    `;
    const existArg = { id: parseInt(req.body.species_id.trim()) };
    try {
      response = await db.any(existQuery, existArg);
    } catch (error) {
      commError(req, res, error, "checkSpeciesIdExists");
    }
    if (response[0].exists) {
      isSpeciesIdGood = true;
    }
  }
  if (!isSpeciesIdGood) {
    res.status(404);
    res.json({
        status: "error",
        message: "species id invalid. please check input and try again",
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
        case "species_id":
          if (!str || isNaN(parseInt(str))) {
            problems.push("invalid referenced species id number");
          };
          break;
        case "nickname":
          if (!str || str.length > 36) {
            problems.push("name too long (36 chars max) or missing");
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


/* FINAL MIDDLEWARES */
async function addAnimal (req, res, next) {
  let response = null;
  let insertQuery = `
    INSERT INTO animals (species_id, nickname) VALUES (
      $/species_id/
      , $/nickname/
      )
      RETURNING *
  `;
  let insertArgs = {
    species_id: parseInt(req.body.species_id.trim()),
    nickname: req.body.nickname.trim()
  };
  try {
    response = await db.one(insertQuery, insertArgs);
  } catch (error) {
    commError(req, res, error, "addAnimal");
  }
  res.status(201);
  res.json({
      status: "success",
      message: "new animal added",
      payload: response
  });
}

async function patchAnimal (req, res, next) {
  let response = null;
  let patchQuery = `
    UPDATE animals 
    SET species_id = $/species_id/
      , nickname = $/nickname/ 
    WHERE id = $/id/ 
    RETURNING *
  `;
  let patchArgs = {
    id: parseInt(req.params.id.trim()),
    species_id: parseInt(req.body.species_id.trim()),
    nickname: req.body.nickname.trim()
  }
  try {
    response = await db.one(patchQuery, patchArgs);
  } catch (error) {
    commError(req, res, error, "patchAnimal");
  }
  res.json({
      status: "success",
      message: "animal record edited",
      payload: response
  });
}

async function delAnimal (req, res, next) {
  let response = null;
  let delQuery = `
    DELETE FROM animals
    WHERE id = $/id/
    RETURNING *;
  `;
  const delArg = { id: parseInt(req.params.id.trim()) };
  try {
    response = await db.one(delQuery, delArg);
  } catch (error) {
    commError(req, res, error, "delAnimal");
  }
  res.json({
      status: "success",
      message: "animal has been deleted",
      payload: response
  });
}

async function getAnimals (req, res, next) {
  let response = null;
  let getQuery = `
    SELECT *
    FROM animals
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
    commError(req, res, error, "getAnimals");
  }
  if (!response.length) {
    res.status(404);
    res.json({
        status: "error",
        message: "no animals found",
        payload: null
    });
  } else {
    res.json({
        status: "success",
        message: response.length > 1 ? "animals found" : "animal found",
        payload: response.length > 1 ? response : response[0]
    });
  }
}


module.exports = router;

