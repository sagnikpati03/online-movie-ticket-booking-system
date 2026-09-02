const {
    getMovies,
    getMovieById
} = require("../models/movieModel");


/* =========================
   LIST MOVIES
   GET /api/movies
========================= */

async function listMovies(req, res) {
    try {

        const {
            search,
            genre,
            language
        } = req.query;


        const movies =
            await getMovies({

                search:
                    typeof search === "string"
                        ? search.trim()
                        : "",

                genre:
                    typeof genre === "string"
                        ? genre.trim()
                        : "",

                language:
                    typeof language === "string"
                        ? language.trim()
                        : ""

            });


        return res.status(200).json({
            movies
        });

    } catch (error) {

        console.error(
            "LIST MOVIES ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to fetch movies."
        });
    }
}


/* =========================
   MOVIE DETAILS
   GET /api/movies/:id
========================= */

async function movieDetails(req, res) {
    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                message:
                    "Invalid movie ID."
            });
        }


        const movie =
            await getMovieById(id);


        if (!movie) {
            return res.status(404).json({
                message:
                    "Movie not found."
            });
        }


        return res.status(200).json({
            movie
        });

    } catch (error) {

        console.error(
            "MOVIE DETAILS ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to fetch movie."
        });
    }
}


module.exports = {
    listMovies,
    movieDetails
};