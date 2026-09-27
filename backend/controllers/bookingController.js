const {
    getSeatsForShow,
    createBooking,
    getBookingsByUserId,
    cancelBookingForUser,
    getBookingByIdForUser,
    getBookingByIdForAdmin,
    getAllBookings
} = require("../models/bookingModel");


async function showSeats(req, res) {
    try {
        const showId = Number(req.params.showId);

        if (!Number.isInteger(showId) || showId <= 0) {
            return res.status(400).json({ message: "Invalid show ID." });
        }

        const result = await getSeatsForShow(showId);

        return res.status(200).json({
            show: result.show,
            movie: {
                id: result.show.movie_id,
                title: result.show.movie_title,
                poster_url: result.show.poster_url
            },
            seats: result.seats
        });
    } catch (error) {
        console.error("SHOW SEATS ERROR:", error);
        const status = error.message === "Show not found or is no longer active." ? 404 : 500;
        return res.status(status).json({
            message: error.message || "Unable to fetch seats."
        });
    }
}

async function create(req, res) {
    try {
        const { showId, seatIds, paymentMethod } = req.body;

        const numericShowId = Number(showId);

        if (!Number.isInteger(numericShowId) || numericShowId <= 0) {
            return res.status(400).json({
                message: "A valid showId is required."
            });
        }

        if (!Array.isArray(seatIds) || seatIds.length === 0) {
            return res.status(400).json({
                message: "Select at least one seat."
            });
        }

        const booking = await createBooking({
            userId: req.user.id,
            showId: numericShowId,
            seatIds,
            paymentMethod
        });

        return res.status(201).json({
            message: "Booking created successfully.",
            booking
        });
    } catch (error) {
        console.error("CREATE BOOKING ERROR:", error);

        const knownErrors = [
            "At least one seat is required.",
            "Show not found or is no longer active.",
            "Invalid seat selection.",
            "One or more selected seats do not exist.",
            "One or more selected seats are not available for this screen.",
            "One or more selected seats have already been booked.",
            "Invalid payment method."
        ];

        const status = knownErrors.includes(error.message) ? 409 : 500;

        return res.status(status).json({
            message: error.message || "Unable to create booking."
        });
    }
}

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


async function cancelMyBooking(req, res) {
    try {
        const bookingId = Number(req.params.id);

        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            return res.status(400).json({ message: "Invalid booking ID." });
        }

        const booking = await cancelBookingForUser(bookingId, req.user.id);

        return res.status(200).json({
            message: "Your booking has been cancelled.",
            booking
        });
    } catch (error) {
        if (error.code === "BOOKING_NOT_FOUND") {
            return res.status(404).json({ message: error.message });
        }

        if (error.code === "BOOKING_NOT_CANCELLABLE") {
            return res.status(409).json({ message: error.message });
        }

        if (error.code === "BOOKING_CUTOFF") {
            return res.status(409).json({ message: error.message });
        }

        console.error("CANCEL BOOKING ERROR:", error);
        return res.status(500).json({
            message: "Unable to cancel this booking right now."
        });
    }
}

async function getOne(req, res) {
    try {
        const bookingId = Number(req.params.id);

        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            return res.status(400).json({
                message: "Invalid booking ID."
            });
        }

        const booking = req.user.role === "admin"
            ? await getBookingByIdForAdmin(bookingId)
            : await getBookingByIdForUser(bookingId, req.user.id);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found."
            });
        }

        return res.status(200).json({ booking });
    } catch (error) {
        console.error("GET BOOKING ERROR:", error);
        return res.status(500).json({
            message: "Unable to fetch booking."
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
    showSeats,
    create,
    myBookings,
    cancelMyBooking,
    getOne,
    allBookings
};
