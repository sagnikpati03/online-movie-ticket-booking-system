const express = require("express");

const {
    showSeats,
    create,
    myBookings,
    getOne,
    allBookings
} = require("../controllers/bookingController");

const {
    authenticateToken,
    requireAdmin
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/shows/:showId/seats",
    authenticateToken,
    showSeats
);

router.post(
    "/",
    authenticateToken,
    create
);

router.get(
    "/my",
    authenticateToken,
    myBookings
);

router.get(
    "/all",
    authenticateToken,
    requireAdmin,
    allBookings
);

router.get(
    "/:id",
    authenticateToken,
    getOne
);

module.exports = router;
