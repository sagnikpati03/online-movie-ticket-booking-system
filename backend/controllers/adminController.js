const admin = require("../models/adminModel");
const { getDashboardStats, getAllBookings } = require("../models/bookingModel");

const id = (value) => {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : null;
};

const sendError = (res, error, fallback = "Operation failed.") => {
    console.error("ADMIN ERROR:", error);
    const duplicate = error?.code === "ER_DUP_ENTRY";
    const foreignKey = error?.code === "ER_ROW_IS_REFERENCED_2" || error?.code === "ER_ROW_IS_REFERENCED";
    return res.status(error?.status || (duplicate ? 409 : foreignKey ? 409 : 500)).json({
        message: duplicate ? "A record with the same unique value already exists."
            : foreignKey ? "This record is being used by another part of the system and cannot be deleted."
            : fallback
    });
};

async function dashboardStats(req, res) {
    try { return res.json({ stats: await getDashboardStats() }); }
    catch (e) { return sendError(res, e, "Unable to fetch dashboard statistics."); }
}

async function getManagementData(req, res) {
    try {
        const [users, movies, theatres, screens, seats, shows, bookings, payments] = await Promise.all([
            admin.getUsers(), admin.getAllMovies(), admin.getTheatres(),
            admin.getScreens(), admin.getSeats(), admin.getShows(), getAllBookings(),
            admin.getPayments()
        ]);
        return res.json({ users, movies, theatres, screens, seats, shows, bookings, payments });
    } catch (e) { return sendError(res, e, "Unable to load admin management data."); }
}

/* USERS */
async function updateUser(req, res) {
    try {
        const userId = id(req.params.id);
        const { name, email, phone, role } = req.body;
        if (!userId || !name?.trim() || !email?.trim() || !["customer", "admin"].includes(role))
            return res.status(400).json({ message: "Valid name, email and role are required." });
        if (userId === req.user.id && role !== "admin")
            return res.status(400).json({ message: "You cannot remove your own admin role." });
        await admin.updateUser(userId, { name: name.trim(), email: email.trim().toLowerCase(), phone: phone?.trim(), role });
        return res.json({ message: "User updated successfully." });
    } catch (e) { return sendError(res, e, "Unable to update user."); }
}

async function deleteUser(req, res) {
    try {
        const userId = id(req.params.id);
        if (!userId) return res.status(400).json({ message: "Invalid user ID." });
        if (userId === req.user.id) return res.status(400).json({ message: "You cannot delete your own account." });
        await admin.deleteUser(userId);
        return res.json({ message: "User deleted successfully." });
    } catch (e) { return sendError(res, e, "Unable to delete user."); }
}

/* MOVIES */
async function createMovie(req,res){ try { validateMovie(req.body); const movieId=await admin.createMovie(req.body); return res.status(201).json({message:"Movie added successfully.",id:movieId}); } catch(e){return sendError(res,e,"Unable to add movie.");}}
async function updateMovie(req,res){ try { validateMovie(req.body); const movieId=id(req.params.id); if(!movieId)return res.status(400).json({message:"Invalid movie ID."}); await admin.updateMovie(movieId,req.body); return res.json({message:"Movie updated successfully."}); } catch(e){return sendError(res,e,"Unable to update movie.");}}
async function deleteMovie(req,res){ try {const movieId=id(req.params.id);if(!movieId)return res.status(400).json({message:"Invalid movie ID."});await admin.deleteMovie(movieId);return res.json({message:"Movie set to inactive."});}catch(e){return sendError(res,e,"Unable to remove movie.");}}

function validateMovie(d){
    if(!d.title?.trim() || !Number(d.duration_minutes) || Number(d.duration_minutes)<1)
        throw Object.assign(new Error("Title and a valid duration are required."),{status:400});
}

/* THEATRES */
async function createTheatre(req,res){try{validateTheatre(req.body);const theatreId=await admin.createTheatre(req.body);return res.status(201).json({message:"Theatre added successfully.",id:theatreId});}catch(e){return sendError(res,e,"Unable to add theatre.");}}
async function updateTheatre(req,res){try{validateTheatre(req.body);const theatreId=id(req.params.id);if(!theatreId)return res.status(400).json({message:"Invalid theatre ID."});await admin.updateTheatre(theatreId,req.body);return res.json({message:"Theatre updated successfully."});}catch(e){return sendError(res,e,"Unable to update theatre.");}}
async function deleteTheatre(req,res){try{const theatreId=id(req.params.id);if(!theatreId)return res.status(400).json({message:"Invalid theatre ID."});await admin.deleteTheatre(theatreId);return res.json({message:"Theatre deleted successfully."});}catch(e){return sendError(res,e,"Unable to delete theatre.");}}
function validateTheatre(d){if(!d.name?.trim()||!d.address?.trim()||!d.city?.trim())throw Object.assign(new Error("Theatre name, address and city are required."),{status:400});}

/* SCREENS */
async function createScreen(req,res){try{validateScreen(req.body);const screenId=await admin.createScreen(req.body);return res.status(201).json({message:"Screen added successfully.",id:screenId});}catch(e){return sendError(res,e,"Unable to add screen.");}}
async function updateScreen(req,res){try{validateScreen(req.body);const screenId=id(req.params.id);if(!screenId)return res.status(400).json({message:"Invalid screen ID."});await admin.updateScreen(screenId,req.body);return res.json({message:"Screen updated successfully."});}catch(e){return sendError(res,e,"Unable to update screen.");}}
async function deleteScreen(req,res){try{const screenId=id(req.params.id);if(!screenId)return res.status(400).json({message:"Invalid screen ID."});await admin.deleteScreen(screenId);return res.json({message:"Screen deleted successfully."});}catch(e){return sendError(res,e,"Unable to delete screen.");}}
function validateScreen(d){if(!id(d.theatre_id)||!d.name?.trim()||Number(d.seat_capacity)<0)throw Object.assign(new Error("Theatre, screen name and valid capacity are required."),{status:400});}

/* SEATS */
async function createSeat(req,res){try{validateSeat(req.body);const seatId=await admin.createSeat(req.body);return res.status(201).json({message:"Seat added successfully.",id:seatId});}catch(e){return sendError(res,e,"Unable to add seat.");}}
async function updateSeat(req,res){try{validateSeat(req.body);const seatId=id(req.params.id);if(!seatId)return res.status(400).json({message:"Invalid seat ID."});await admin.updateSeat(seatId,req.body);return res.json({message:"Seat updated successfully."});}catch(e){return sendError(res,e,"Unable to update seat.");}}
async function deleteSeat(req,res){try{const seatId=id(req.params.id);if(!seatId)return res.status(400).json({message:"Invalid seat ID."});await admin.deleteSeat(seatId);return res.json({message:"Seat deleted successfully."});}catch(e){return sendError(res,e,"Unable to delete seat.");}}
function validateSeat(d){if(!id(d.screen_id)||!d.seat_number?.trim()||!["regular","premium","vip"].includes(d.seat_type)||Number(d.price_multiplier)<=0)throw Object.assign(new Error("Screen, seat number, type and valid multiplier are required."),{status:400});}

/* SHOWS */
async function createShow(req,res){try{validateShow(req.body);const showId=await admin.createShow(req.body);return res.status(201).json({message:"Show added successfully.",id:showId});}catch(e){return sendError(res,e,"Unable to add show.");}}
async function updateShow(req,res){try{validateShow(req.body);const showId=id(req.params.id);if(!showId)return res.status(400).json({message:"Invalid show ID."});await admin.updateShow(showId,req.body);return res.json({message:"Show updated successfully."});}catch(e){return sendError(res,e,"Unable to update show.");}}
async function deleteShow(req,res){try{const showId=id(req.params.id);if(!showId)return res.status(400).json({message:"Invalid show ID."});await admin.deleteShow(showId);return res.json({message:"Show cancelled successfully."});}catch(e){return sendError(res,e,"Unable to cancel show.");}}
function validateShow(d){if(!id(d.movie_id)||!id(d.theatre_id)||!id(d.screen_id)||!d.show_date||!d.start_time||!d.end_time||Number(d.base_price)<0)throw Object.assign(new Error("Movie, theatre, screen, date, times and price are required."),{status:400});}

/* BOOKINGS */
async function updateBooking(req,res){try{const bookingId=id(req.params.id);const {status}=req.body;if(!bookingId||!["pending","confirmed","cancelled"].includes(status))return res.status(400).json({message:"Invalid booking status."});await admin.updateBookingStatus(bookingId,status);return res.json({message:"Booking status updated successfully."});}catch(e){return sendError(res,e,"Unable to update booking.");}}

module.exports = {
    dashboardStats,getManagementData,
    updateUser,deleteUser,
    createMovie,updateMovie,deleteMovie,
    createTheatre,updateTheatre,deleteTheatre,
    createScreen,updateScreen,deleteScreen,
    createSeat,updateSeat,deleteSeat,
    createShow,updateShow,deleteShow,
    updateBooking
};
