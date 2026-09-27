const express = require("express");
const cors = require("cors");
const path = require("path");


const authRoutes =
    require("./routes/authRoutes");

const movieRoutes =
    require("./routes/movieRoutes");

const bookingRoutes =
    require("./routes/bookingRoutes");

const adminRoutes =
    require("./routes/adminRoutes");


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

// Publicly serve poster files uploaded by administrators.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


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

app.use(
    "/api/bookings",
    bookingRoutes
);

app.use(
    "/api/admin",
    adminRoutes
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


        const status = err.code === "LIMIT_FILE_SIZE" ? 413 : (err.status || 500);
        const message = err.code === "LIMIT_FILE_SIZE"
            ? "Poster image must be 5 MB or smaller."
            : (err.message || "Internal server error.");

        res.status(status).json({ message });

    }
);


module.exports = app;