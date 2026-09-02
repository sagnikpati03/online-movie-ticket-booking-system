const express = require("express");

const {
    dashboardStats
} = require("../controllers/adminController");

const {
    authenticateToken,
    requireAdmin
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/dashboard",
    authenticateToken,
    requireAdmin,
    dashboardStats
);

module.exports = router;
