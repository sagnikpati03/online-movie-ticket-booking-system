const express = require("express");

const {
    listMovies,
    movieDetails
} = require("../controllers/movieController");


const router =
    express.Router();


router.get(
    "/",
    listMovies
);


router.get(
    "/:id",
    movieDetails
);


module.exports = router;