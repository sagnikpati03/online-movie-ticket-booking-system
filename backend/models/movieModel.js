const db = require("../config/db");


async function getMovies({
    search = "",
    genre = "",
    language = ""
}) {
    let sql = `
        SELECT
            id,
            title,
            description,
            genre,
            language,
            duration_minutes,
            release_date,
            certificate,
            director,
            \`cast\`,
            poster_url,
            trailer_url,
            status,
            created_at
        FROM movies
        WHERE status = 'active'
    `;

    const values = [];


    /* SEARCH */

    if (search) {
        sql += `
            AND (
                title LIKE ?
                OR description LIKE ?
                OR director LIKE ?
                OR \`cast\` LIKE ?
            )
        `;

        const searchValue = `%${search}%`;

        values.push(
            searchValue,
            searchValue,
            searchValue,
            searchValue
        );
    }


    /* GENRE */

    if (genre) {
        sql += `
            AND genre = ?
        `;

        values.push(genre);
    }


    /* LANGUAGE */

    if (language) {
        sql += `
            AND language = ?
        `;

        values.push(language);
    }


    sql += `
        ORDER BY created_at DESC
    `;


    const [rows] = await db.execute(
        sql,
        values
    );

    return rows;
}


async function getMovieById(id) {
    const [rows] = await db.execute(
        `
        SELECT
            id,
            title,
            description,
            genre,
            language,
            duration_minutes,
            release_date,
            certificate,
            director,
            \`cast\`,
            poster_url,
            trailer_url,
            status,
            created_at
        FROM movies
        WHERE id = ?
          AND status = 'active'
        LIMIT 1
        `,
        [id]
    );

    return rows[0] || null;
}


async function getShowsForMovie(movieId) {
    const [rows] = await db.execute(`
        SELECT
            s.id,
            s.movie_id,
            s.theatre_id,
            s.screen_id,
            s.show_date,
            s.start_time,
            s.end_time,
            s.base_price,
            s.status,
            t.name AS theatre_name,
            t.city,
            sc.name AS screen_name
        FROM shows s
        INNER JOIN theatres t ON t.id = s.theatre_id
        INNER JOIN screens sc ON sc.id = s.screen_id
        WHERE s.movie_id = ?
          AND s.status = 'active'
          AND t.id = s.theatre_id
          AND sc.id = s.screen_id
        ORDER BY s.show_date ASC, s.start_time ASC
    `, [movieId]);

    return rows;
}

module.exports = {
    getMovies,
    getMovieById,
    getShowsForMovie
};