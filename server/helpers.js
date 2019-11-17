/*
Joseph P. Pasaoa
Server Helpers || Under the Seas App || Unit3 Assessment
*/


const log = console.log;

const pgp = require('pg-promise')();
    const connectString = 'postgres://localhost:5432/under_the_seas_db';
    const db = pgp(connectString);


module.exports = {
  log,
  db
};
