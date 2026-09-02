const db = require("../config/db");


async function findUserByEmail(email) {
    const [rows] = await db.execute(
        `
        SELECT
            id,
            name,
            email,
            password,
            phone,
            role,
            created_at
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email]
    );

    return rows[0] || null;
}


async function findUserById(id) {
    const [rows] = await db.execute(
        `
        SELECT
            id,
            name,
            email,
            phone,
            role,
            created_at
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );

    return rows[0] || null;
}


async function createUser({
    name,
    email,
    password,
    phone
}) {
    const [result] = await db.execute(
        `
        INSERT INTO users
        (
            name,
            email,
            password,
            phone,
            role
        )
        VALUES
        (?, ?, ?, ?, 'customer')
        `,
        [
            name,
            email,
            password,
            phone || null
        ]
    );

    return result.insertId;
}


module.exports = {
    findUserByEmail,
    findUserById,
    createUser
};