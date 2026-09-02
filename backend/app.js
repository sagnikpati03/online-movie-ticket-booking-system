const express = require("express");
const cors = require("cors");


const authRoutes =
    require("./routes/authRoutes");

const movieRoutes =
    require("./routes/movieRoutes");


const app =
    express();


/* =========================
   MIDDLEWARE
========================= */

app.use(
    cors({
        origin:
            process.env.FRONTEND_URL ||
            "http://localhost:5173",

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);


app.use(
    express.json()
);


/* =========================
   HEALTH CHECK
========================= */

app.get(
    "/",
    (req, res) => {

        res.status(200).json({
            message:
                "Movie Ticket Booking API is running."
        });

    }
);


/* =========================
   API ROUTES
========================= */

app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/movies",
    movieRoutes
);


/* =========================
   404 HANDLER
========================= */

app.use(
    (req, res) => {

        res.status(404).json({
            message:
                "API endpoint not found."
        });

    }
);


/* =========================
   ERROR HANDLER
========================= */

app.use(
    (err, req, res, next) => {

        console.error(
            "SERVER ERROR:",
            err
        );


        res.status(
            err.status || 500
        ).json({
            message:
                err.message ||
                "Internal server error."
        });

    }
);


module.exports = app;