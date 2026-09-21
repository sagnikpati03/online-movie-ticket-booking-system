const express = require("express");

const {
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
