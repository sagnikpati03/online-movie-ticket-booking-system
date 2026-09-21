const express = require("express");

const {
    listMovies,
    movieDetails,
    movieShows
} = require("../controllers/movieController");

const router = express.Router();

router.get("/", listMovies);

router.get("/:id/shows", movieShows);

router.get("/:id", movieDetails);

module.exports = router;
