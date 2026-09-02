const express = require("express");

const {
    myBookings,
    allBookings
} = require("../controllers/bookingController");

const {
    authenticateToken,
    requireAdmin
} = require("../middleware/authMiddleware");

const router = express.Router();

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

module.exports = router;
