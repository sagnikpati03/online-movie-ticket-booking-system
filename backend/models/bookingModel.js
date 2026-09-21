const db = require("../config/db");

async function createBooking({
    userId,
    showId,
    seatIds,
    paymentMethod = null
}) {
    if (!Array.isArray(seatIds) || seatIds.length === 0) {
        throw new Error("At least one seat is required.");
    }

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [shows] = await connection.execute(`
            SELECT
                s.id,
                s.show_date,
                s.start_time,
                s.end_time,
                s.base_price,
                s.status,
                s.movie_id,
                s.theatre_id,
                s.screen_id,
                m.title AS movie_title,
                m.poster_url,
                t.name AS theatre_name,
                t.city,
                sc.name AS screen_name
            FROM shows s
            INNER JOIN movies m ON m.id = s.movie_id
            INNER JOIN theatres t ON t.id = s.theatre_id
            INNER JOIN screens sc ON sc.id = s.screen_id
            WHERE s.id = ? AND s.status = 'active'
            LIMIT 1
        `, [showId]);

        if (!shows.length) {
            throw new Error("Show not found or is no longer active.");
        }

        const show = shows[0];

        const uniqueSeatIds = [...new Set(
            seatIds.map(Number).filter(Number.isInteger)
        )];

        if (uniqueSeatIds.length !== seatIds.length) {
            throw new Error("Invalid seat selection.");
        }

        const placeholders = uniqueSeatIds.map(() => "?").join(",");

        const [seats] = await connection.execute(`
            SELECT
                id,
                screen_id,
                seat_number,
                seat_type,
                price_multiplier,
                is_active
            FROM seats
            WHERE id IN (${placeholders})
            FOR UPDATE
        `, uniqueSeatIds);

        if (seats.length !== uniqueSeatIds.length) {
            throw new Error("One or more selected seats do not exist.");
        }

        if (seats.some(
            seat => Number(seat.screen_id) !== Number(show.screen_id) ||
                    !seat.is_active
        )) {
            throw new Error("One or more selected seats are not available for this screen.");
        }

        // A seat is considered unavailable for this show if it is already
        // attached to a pending/confirmed booking for the same show.
        const [alreadyBooked] = await connection.execute(`
            SELECT bs.seat_id
            FROM booking_seats bs
            INNER JOIN bookings b ON b.id = bs.booking_id
            WHERE b.show_id = ?
              AND b.status IN ('pending', 'confirmed')
              AND bs.seat_id IN (${placeholders})
            FOR UPDATE
        `, [showId, ...uniqueSeatIds]);

        if (alreadyBooked.length) {
            throw new Error("One or more selected seats have already been booked.");
        }

        const totalAmount = seats.reduce(
            (sum, seat) =>
                sum + Number(show.base_price) * Number(seat.price_multiplier),
            0
        );

        const bookingCode =
            `MTB${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;

        const [bookingResult] = await connection.execute(`
            INSERT INTO bookings
                (booking_code, user_id, show_id, total_amount, status)
            VALUES
                (?, ?, ?, ?, 'confirmed')
        `, [
            bookingCode,
            userId,
            showId,
            totalAmount
        ]);

        const bookingId = bookingResult.insertId;

        for (const seat of seats) {
            const price =
                Number(show.base_price) * Number(seat.price_multiplier);

            await connection.execute(`
                INSERT INTO booking_seats
                    (booking_id, seat_id, price)
                VALUES
                    (?, ?, ?)
            `, [
                bookingId,
                seat.id,
                price
            ]);
        }

        if (paymentMethod) {
            const normalizedMethod = String(paymentMethod).toLowerCase();

            if (!["upi", "card", "netbanking"].includes(normalizedMethod)) {
                throw new Error("Invalid payment method.");
            }

            const transactionId =
                `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

            await connection.execute(`
                INSERT INTO payments
                    (booking_id, payment_method, amount, payment_status, transaction_id, paid_at)
                VALUES
                    (?, ?, ?, 'success', ?, NOW())
            `, [
                bookingId,
                normalizedMethod,
                totalAmount,
                transactionId
            ]);
        }

        await connection.commit();

        return getBookingByIdForUser(bookingId, userId);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

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
            sc.name AS screen_name,
            GROUP_CONCAT(bs.seat_id ORDER BY bs.seat_id SEPARATOR ',') AS seat_ids
        FROM bookings b
        INNER JOIN shows s ON s.id = b.show_id
        INNER JOIN movies m ON m.id = s.movie_id
        INNER JOIN theatres t ON t.id = s.theatre_id
        INNER JOIN screens sc ON sc.id = s.screen_id
        LEFT JOIN booking_seats bs ON bs.booking_id = b.id
        WHERE b.user_id = ?
        GROUP BY
            b.id, b.booking_code, b.booking_date, b.total_amount, b.status,
            s.show_date, s.start_time, s.end_time,
            m.id, m.title, m.poster_url,
            t.name, t.city, sc.name
        ORDER BY b.created_at DESC
    `, [userId]);

    return rows;
}

async function getBookingByIdForUser(bookingId, userId) {
    const [rows] = await db.execute(`
        SELECT
            b.id,
            b.booking_code,
            b.booking_date,
            b.total_amount,
            b.status,
            b.user_id,
            s.id AS show_id,
            s.show_date,
            s.start_time,
            s.end_time,
            s.base_price,
            m.id AS movie_id,
            m.title AS movie_title,
            m.description,
            m.genre,
            m.language,
            m.duration_minutes,
            m.release_date,
            m.certificate,
            m.director,
            m.\`cast\` AS movie_cast,
            m.poster_url,
            m.trailer_url,
            t.id AS theatre_id,
            t.name AS theatre_name,
            t.address AS theatre_address,
            t.city,
            sc.id AS screen_id,
            sc.name AS screen_name,
            u.name AS customer_name,
            u.email AS customer_email,
            p.payment_method,
            p.payment_status,
            p.transaction_id,
            p.paid_at,
            GROUP_CONCAT(
                CONCAT(
                    bs.seat_id,
                    ':',
                    se.seat_number,
                    ':',
                    bs.price
                )
                ORDER BY se.id
                SEPARATOR ','
            ) AS seats
        FROM bookings b
        INNER JOIN users u ON u.id = b.user_id
        INNER JOIN shows s ON s.id = b.show_id
        INNER JOIN movies m ON m.id = s.movie_id
        INNER JOIN theatres t ON t.id = s.theatre_id
        INNER JOIN screens sc ON sc.id = s.screen_id
        LEFT JOIN payments p ON p.booking_id = b.id
        LEFT JOIN booking_seats bs ON bs.booking_id = b.id
        LEFT JOIN seats se ON se.id = bs.seat_id
        WHERE b.id = ? AND b.user_id = ?
        GROUP BY
            b.id, b.booking_code, b.booking_date, b.total_amount, b.status, b.user_id,
            s.id, s.show_date, s.start_time, s.end_time, s.base_price,
            m.id, m.title, m.description, m.genre, m.language, m.duration_minutes,
            m.release_date, m.certificate, m.director, m.\`cast\`, m.poster_url, m.trailer_url,
            t.id, t.name, t.address, t.city,
            sc.id, sc.name,
            u.name, u.email,
            p.payment_method, p.payment_status, p.transaction_id, p.paid_at
        LIMIT 1
    `, [bookingId, userId]);

    if (!rows.length) return null;

    const row = rows[0];

    row.seats = row.seats
        ? row.seats.split(",").map(value => {
            const [id, number, price] = value.split(":");
            return {
                id: Number(id),
                seat_number: number,
                price: Number(price)
            };
        })
        : [];

    return row;
}

async function getBookingByIdForAdmin(bookingId) {
    const [rows] = await db.execute(`
        SELECT
            b.id,
            b.booking_code,
            b.booking_date,
            b.total_amount,
            b.status,
            b.user_id,
            s.id AS show_id,
            s.show_date,
            s.start_time,
            s.end_time,
            m.id AS movie_id,
            m.title AS movie_title,
            m.poster_url,
            t.id AS theatre_id,
            t.name AS theatre_name,
            t.city,
            sc.id AS screen_id,
            sc.name AS screen_name,
            u.name AS customer_name,
            u.email AS customer_email,
            p.payment_method,
            p.payment_status,
            p.transaction_id,
            p.paid_at,
            GROUP_CONCAT(
                CONCAT(bs.seat_id, ':', se.seat_number, ':', bs.price)
                ORDER BY se.id SEPARATOR ','
            ) AS seats
        FROM bookings b
        INNER JOIN users u ON u.id = b.user_id
        INNER JOIN shows s ON s.id = b.show_id
        INNER JOIN movies m ON m.id = s.movie_id
        INNER JOIN theatres t ON t.id = s.theatre_id
        INNER JOIN screens sc ON sc.id = s.screen_id
        LEFT JOIN payments p ON p.booking_id = b.id
        LEFT JOIN booking_seats bs ON bs.booking_id = b.id
        LEFT JOIN seats se ON se.id = bs.seat_id
        WHERE b.id = ?
        GROUP BY
            b.id, b.booking_code, b.booking_date, b.total_amount, b.status, b.user_id,
            s.id, s.show_date, s.start_time, s.end_time,
            m.id, m.title, m.poster_url,
            t.id, t.name, t.city,
            sc.id, sc.name,
            u.name, u.email,
            p.payment_method, p.payment_status, p.transaction_id, p.paid_at
        LIMIT 1
    `, [bookingId]);

    if (!rows.length) return null;

    const row = rows[0];
    row.seats = row.seats
        ? row.seats.split(",").map(value => {
            const [id, number, price] = value.split(":");
            return {
                id: Number(id),
                seat_number: number,
                price: Number(price)
            };
        })
        : [];

    return row;
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
    createBooking,
    getBookingsByUserId,
    getBookingByIdForUser,
    getBookingByIdForAdmin,
    getAllBookings,
    getDashboardStats
};
