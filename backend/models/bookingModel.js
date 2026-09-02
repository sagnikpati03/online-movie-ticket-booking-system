const db = require("../config/db");

async function getBookingsByUserId(userId) {
    const [rows] = await db.execute(`
        SELECT
            b.id,
            b.booking_code,
            b.booking_date,
            b.total_amount,
            b.status,
            s.show_date,
            s.start_time,
            s.end_time,
            m.id AS movie_id,
            m.title AS movie_title,
            m.poster_url,
            t.name AS theatre_name,
            t.city,
            GROUP_CONCAT(bs.seat_id ORDER BY bs.seat_id SEPARATOR ',') AS seat_ids
        FROM bookings b
        INNER JOIN shows s ON s.id = b.show_id
        INNER JOIN movies m ON m.id = s.movie_id
        INNER JOIN theatres t ON t.id = s.theatre_id
        LEFT JOIN booking_seats bs ON bs.booking_id = b.id
        WHERE b.user_id = ?
        GROUP BY
            b.id, b.booking_code, b.booking_date, b.total_amount, b.status,
            s.show_date, s.start_time, s.end_time,
            m.id, m.title, m.poster_url,
            t.name, t.city
        ORDER BY b.created_at DESC
    `, [userId]);

    return rows;
}

async function getAllBookings() {
    const [rows] = await db.execute(`
        SELECT
            b.id,
            b.booking_code,
            b.booking_date,
            b.total_amount,
            b.status,
            u.name AS customer_name,
            u.email AS customer_email,
            m.title AS movie_title,
            s.show_date,
            s.start_time,
            t.name AS theatre_name,
            t.city
        FROM bookings b
        INNER JOIN users u ON u.id = b.user_id
        INNER JOIN shows s ON s.id = b.show_id
        INNER JOIN movies m ON m.id = s.movie_id
        INNER JOIN theatres t ON t.id = s.theatre_id
        ORDER BY b.created_at DESC
    `);

    return rows;
}

async function getDashboardStats() {
    const [[users]] = await db.execute(`
        SELECT COUNT(*) AS total_users FROM users
    `);

    const [[movies]] = await db.execute(`
        SELECT COUNT(*) AS total_movies
        FROM movies
        WHERE status = 'active'
    `);

    const [[bookings]] = await db.execute(`
        SELECT COUNT(*) AS total_bookings
        FROM bookings
    `);

    const [[revenue]] = await db.execute(`
        SELECT COALESCE(SUM(total_amount), 0) AS total_revenue
        FROM bookings
        WHERE status = 'confirmed'
    `);

    return {
        total_users: Number(users.total_users),
        total_movies: Number(movies.total_movies),
        total_bookings: Number(bookings.total_bookings),
        total_revenue: Number(revenue.total_revenue)
    };
}

module.exports = {
    getBookingsByUserId,
    getAllBookings,
    getDashboardStats
};
