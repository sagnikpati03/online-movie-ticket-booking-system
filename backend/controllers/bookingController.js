const {
    getBookingsByUserId,
    getAllBookings
} = require("../models/bookingModel");

async function myBookings(req, res) {
    try {
        const bookings = await getBookingsByUserId(req.user.id);

        return res.status(200).json({ bookings });
    } catch (error) {
        console.error("MY BOOKINGS ERROR:", error);
        return res.status(500).json({
            message: "Unable to fetch your bookings."
        });
    }
}

async function allBookings(req, res) {
    try {
        const bookings = await getAllBookings();

        return res.status(200).json({ bookings });
    } catch (error) {
        console.error("ALL BOOKINGS ERROR:", error);
        return res.status(500).json({
            message: "Unable to fetch bookings."
        });
    }
}

module.exports = {
    myBookings,
    allBookings
};
