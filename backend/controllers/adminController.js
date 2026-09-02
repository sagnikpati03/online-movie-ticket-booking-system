const {
    getDashboardStats
} = require("../models/bookingModel");

async function dashboardStats(req, res) {
    try {
        const stats = await getDashboardStats();

        return res.status(200).json({ stats });
    } catch (error) {
        console.error("ADMIN DASHBOARD ERROR:", error);
        return res.status(500).json({
            message: "Unable to fetch dashboard statistics."
        });
    }
}

module.exports = {
    dashboardStats
};
