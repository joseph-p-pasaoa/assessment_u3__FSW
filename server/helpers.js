/*
Joseph P. Pasaoa
Server Helpers || Under the Seas App || Unit3 Assessment
*/


const pgp = require('pg-promise')();
    const connectString = 'postgres://localhost:5432/under_the_seas_db';
    const db = pgp(connectString);


const log = console.log;

const commError = (req, res, err, fxName) => { // handles errors communicating with database
  log(`${fxName}: ${err}`);
  res.status(err.status || 500);
  res.json({
      status: "fail",
      message: "error: problem communicating with server. please try again later",
      err: true
  });
}

module.exports = {
  db,
  log,
  commError
};
