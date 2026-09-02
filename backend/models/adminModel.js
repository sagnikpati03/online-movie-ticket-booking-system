const db = require("../config/db");

/* USERS */
async function getUsers() {
    const [rows] = await db.execute(`
        SELECT id, name, email, phone, role, created_at
        FROM users
        ORDER BY created_at DESC
    `);
    return rows;
}

async function updateUser(id, { name, email, phone, role }) {
    const [result] = await db.execute(`
        UPDATE users
        SET name = ?, email = ?, phone = ?, role = ?
        WHERE id = ?
    `, [name, email, phone || null, role, id]);
    return result.affectedRows;
}

async function deleteUser(id) {
    const [result] = await db.execute(`DELETE FROM users WHERE id = ?`, [id]);
    return result.affectedRows;
}

/* MOVIES */
async function getAllMovies() {
    const [rows] = await db.execute(`
        SELECT id, title, description, genre, language, duration_minutes,
               release_date, certificate, director, \`cast\`, poster_url,
               trailer_url, status, created_at
        FROM movies ORDER BY created_at DESC
    `);
    return rows;
}

async function createMovie(data) {
    const [result] = await db.execute(`
        INSERT INTO movies
        (title, description, genre, language, duration_minutes, release_date,
         certificate, director, \`cast\`, poster_url, trailer_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        data.title, data.description || null, data.genre || null, data.language || null,
        Number(data.duration_minutes), data.release_date || null, data.certificate || null,
        data.director || null, data.cast || null, data.poster_url || null,
        data.trailer_url || null, data.status || "active"
    ]);
    return result.insertId;
}

async function updateMovie(id, data) {
    const [result] = await db.execute(`
        UPDATE movies SET title=?, description=?, genre=?, language=?,
        duration_minutes=?, release_date=?, certificate=?, director=?, \`cast\`=?,
        poster_url=?, trailer_url=?, status=? WHERE id=?
    `, [
        data.title, data.description || null, data.genre || null, data.language || null,
        Number(data.duration_minutes), data.release_date || null, data.certificate || null,
        data.director || null, data.cast || null, data.poster_url || null,
        data.trailer_url || null, data.status || "active", id
    ]);
    return result.affectedRows;
}

async function deleteMovie(id) {
    // Keep historical references intact; make the movie inactive instead.
    const [result] = await db.execute(`UPDATE movies SET status='inactive' WHERE id=?`, [id]);
    return result.affectedRows;
}

/* THEATRES */
async function getTheatres() {
    const [rows] = await db.execute(`
        SELECT id, name, address, city, contact
        FROM theatres ORDER BY name
    `);
    return rows;
}

async function createTheatre(data) {
    const [result] = await db.execute(`
        INSERT INTO theatres (name, address, city, contact)
        VALUES (?, ?, ?, ?)
    `, [data.name, data.address, data.city, data.contact || null]);
    return result.insertId;
}

async function updateTheatre(id, data) {
    const [result] = await db.execute(`
        UPDATE theatres SET name=?, address=?, city=?, contact=? WHERE id=?
    `, [data.name, data.address, data.city, data.contact || null, id]);
    return result.affectedRows;
}

async function deleteTheatre(id) {
    const [result] = await db.execute(`DELETE FROM theatres WHERE id=?`, [id]);
    return result.affectedRows;
}

/* SCREENS */
async function getScreens() {
    const [rows] = await db.execute(`
        SELECT s.id, s.theatre_id, s.name, s.seat_capacity, s.created_at,
               t.name AS theatre_name, t.city
        FROM screens s
        INNER JOIN theatres t ON t.id=s.theatre_id
        ORDER BY t.name, s.name
    `);
    return rows;
}

async function createScreen(data) {
    const [result] = await db.execute(`
        INSERT INTO screens (theatre_id, name, seat_capacity)
        VALUES (?, ?, ?)
    `, [Number(data.theatre_id), data.name, Number(data.seat_capacity || 0)]);
    return result.insertId;
}

async function updateScreen(id, data) {
    const [result] = await db.execute(`
        UPDATE screens SET theatre_id=?, name=?, seat_capacity=? WHERE id=?
    `, [Number(data.theatre_id), data.name, Number(data.seat_capacity || 0), id]);
    return result.affectedRows;
}

async function deleteScreen(id) {
    const [result] = await db.execute(`DELETE FROM screens WHERE id=?`, [id]);
    return result.affectedRows;
}

/* SEATS */
async function getSeats() {
    const [rows] = await db.execute(`
        SELECT se.id, se.screen_id, se.seat_number, se.seat_type,
               se.price_multiplier, se.is_active,
               sc.name AS screen_name, t.name AS theatre_name
        FROM seats se
        INNER JOIN screens sc ON sc.id=se.screen_id
        INNER JOIN theatres t ON t.id=sc.theatre_id
        ORDER BY t.name, sc.name, se.seat_number
    `);
    return rows;
}

async function createSeat(data) {
    const [result] = await db.execute(`
        INSERT INTO seats (screen_id, seat_number, seat_type, price_multiplier, is_active)
        VALUES (?, ?, ?, ?, ?)
    `, [
        Number(data.screen_id), data.seat_number, data.seat_type || "regular",
        Number(data.price_multiplier || 1), data.is_active !== false
    ]);
    return result.insertId;
}

async function updateSeat(id, data) {
    const [result] = await db.execute(`
        UPDATE seats SET screen_id=?, seat_number=?, seat_type=?,
        price_multiplier=?, is_active=? WHERE id=?
    `, [
        Number(data.screen_id), data.seat_number, data.seat_type || "regular",
        Number(data.price_multiplier || 1), data.is_active !== false, id
    ]);
    return result.affectedRows;
}

async function deleteSeat(id) {
    const [result] = await db.execute(`DELETE FROM seats WHERE id=?`, [id]);
    return result.affectedRows;
}

/* SHOWS */
async function getShows() {
    const [rows] = await db.execute(`
        SELECT sh.id, sh.movie_id, sh.theatre_id, sh.screen_id,
               sh.show_date, sh.start_time, sh.end_time, sh.base_price, sh.status,
               m.title AS movie_title, t.name AS theatre_name, t.city,
               sc.name AS screen_name
        FROM shows sh
        INNER JOIN movies m ON m.id=sh.movie_id
        INNER JOIN theatres t ON t.id=sh.theatre_id
        INNER JOIN screens sc ON sc.id=sh.screen_id
        ORDER BY sh.show_date DESC, sh.start_time DESC
    `);
    return rows;
}

async function createShow(data) {
    const [result] = await db.execute(`
        INSERT INTO shows
        (movie_id, theatre_id, screen_id, show_date, start_time, end_time, base_price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        Number(data.movie_id), Number(data.theatre_id), Number(data.screen_id),
        data.show_date, data.start_time, data.end_time, Number(data.base_price),
        data.status || "active"
    ]);
    return result.insertId;
}

async function updateShow(id, data) {
    const [result] = await db.execute(`
        UPDATE shows SET movie_id=?, theatre_id=?, screen_id=?, show_date=?,
        start_time=?, end_time=?, base_price=?, status=? WHERE id=?
    `, [
        Number(data.movie_id), Number(data.theatre_id), Number(data.screen_id),
        data.show_date, data.start_time, data.end_time, Number(data.base_price),
        data.status || "active", id
    ]);
    return result.affectedRows;
}

async function deleteShow(id) {
    const [result] = await db.execute(`UPDATE shows SET status='cancelled' WHERE id=?`, [id]);
    return result.affectedRows;
}

/* PAYMENTS - read-only financial record view for administrators */
async function getPayments() {
    const [rows] = await db.execute(`
        SELECT p.id, p.booking_id, p.payment_method, p.amount,
               p.payment_status, p.transaction_id, p.paid_at,
               b.booking_code, u.name AS customer_name, u.email AS customer_email
        FROM payments p
        INNER JOIN bookings b ON b.id = p.booking_id
        INNER JOIN users u ON u.id = b.user_id
        ORDER BY p.created_at DESC
    `);
    return rows;
}

/* BOOKINGS */
async function updateBookingStatus(id, status) {
    const [result] = await db.execute(`
        UPDATE bookings SET status=? WHERE id=?
    `, [status, id]);
    return result.affectedRows;
}

module.exports = {
    getUsers, updateUser, deleteUser,
    getAllMovies, createMovie, updateMovie, deleteMovie,
    getTheatres, createTheatre, updateTheatre, deleteTheatre,
    getScreens, createScreen, updateScreen, deleteScreen,
    getSeats, createSeat, updateSeat, deleteSeat,
    getShows, createShow, updateShow, deleteShow,
    updateBookingStatus, getPayments
};
