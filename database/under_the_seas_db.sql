/*
Joseph P. Pasaoa
Under the Sea Database Init + Seed || Unit 3 Assessment
*/


/* CREATE DATABASE */
DROP DATABASE IF EXISTS under_the_seas_db;
CREATE DATABASE under_the_seas_db;
\c under_the_seas_db;

CREATE TABLE researchers (
   id SERIAL PRIMARY KEY,
   name VARCHAR(36) NOT NULL,
   job_title VARCHAR(54)
);

CREATE TABLE species (
   id SERIAL PRIMARY KEY,
   name VARCHAR(36),
   is_mammal BOOLEAN NOT NULL
);

CREATE TABLE animals (
   id SERIAL PRIMARY KEY,
   species_id INT REFERENCES species (id),
   nickname VARCHAR(36)
);

CREATE TABLE habitats (
   id SERIAL PRIMARY KEY,
   category VARCHAR(54) NOT NULL
);

CREATE TABLE sightings (
   id SERIAL PRIMARY KEY,
   researcher_id INT REFERENCES researchers (id) ON DELETE SET NULL,
   species_id INT REFERENCES species (id) ON DELETE CASCADE,
   habitat_id INT REFERENCES habitats (id) ON DELETE NO ACTION
);


/* SEED DATA */
INSERT INTO researchers (name, job_title) VALUES
   ('Mariana Aleta', 'Project Lead'), -- 1
   ('Javed Patrick', 'Senior Field Researcher'), -- 2
   ('Carolina Itai', 'Field Researcher'), -- 3
   ('Jazmyn Gottfried', 'Field Researcher'), -- 4
   ('Ezra Flip', 'Research Intern'); -- 5

INSERT INTO species (name, is_mammal) VALUES
   ('Dolphin', true), -- 1
   ('Moray Eel', false), -- 2
   ('Tiger Shark', false), -- 3
   ('Orca Whale', true), -- 4
   ('Moon Jelly', false); -- 5

INSERT INTO animals (species_id, nickname) VALUES
   (1, 'Flip'),      -- Dolphin
   (1, 'Skip'),      -- Dolphin
   (2, 'Jenkins'),   -- Moray Eel
   (3, 'Sally'),     -- Tiger Shark
   (5, 'Flapjack'),  -- Moon Jelly
   (5, 'Gibbous'),   -- Moon Jelly
   (5, 'Nox');       -- Moon Jelly


INSERT INTO habitats (category) VALUES
   ('Shallows'), -- 1
   ('Coral Reef'), -- 2
   ('Tide Pools'), -- 3
   ('Deeps'); -- 4

INSERT INTO sightings (researcher_id, species_id, habitat_id) VALUES
   (4, 4, 4), -- An Orca Whale was spotted by Jazmyn Gottfried in the Deeps.
   (1, 3, 4), -- A Tiger Shark was spotted by Mariana Aleta in the Deeps.
   (3, 5, 3), -- A Moon Jelly was spotted by Carolina Itai in the Tide Pools.
   (5, 2, 2), -- A Moray Eel was spotted by Ezra Flip in the Coral Reef.
   (2, 1, 1), -- A Dolphin was spotted by Javed Patrick in the Shallows.
   (5, 2, 1); -- A Moray Eel was spotted by Ezra Flip in the Shallows.


/* DISPLAY QUERIES */
SELECT * FROM researchers;
SELECT * FROM species;
SELECT * FROM animals;
SELECT * FROM habitats;
SELECT * FROM sightings;
