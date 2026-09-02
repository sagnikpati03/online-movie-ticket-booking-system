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


module.exports = {
    getMovies,
    getMovieById
};