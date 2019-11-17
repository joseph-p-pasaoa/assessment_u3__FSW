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
GET /: Get all researchers.
GET /:id: Get single researcher.
POST : Add new researcher.
PATCH /:id: Update single researcher.
DELETE /:id: Delete single researcher.
*/


/* ROUTES */
router.get('/', getResearchers);
router.get('/:id', getResearchers);


/* MIDDLEWARE */
async function getResearchers (req, res, next) {
  try {
    let getQuery = `
      SELECT *
      FROM researchers
    `;
    let getArgs = null;
    if (req.params.id) {
      getQuery += ` WHERE id = $/id/`;
      getArgs = { id: req.params.id };
    }
    const response = await db.any(getQuery, getArgs);
    if (!response.length) {
      res.status(204);
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
  } catch (error) {
    commError(req, res, error, "getResearcher");
  }
}


module.exports = router;
