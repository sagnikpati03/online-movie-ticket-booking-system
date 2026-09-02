require("dotenv").config();


const app =
    require("./app");

const db =
    require("./config/db");

const bcrypt =
    require("bcrypt");


const PORT =
    Number(process.env.PORT) || 5000;




async function ensureAdminUser() {
    const email = (process.env.ADMIN_EMAIL || "admin@gmail.com")
        .trim()
        .toLowerCase();

    const password = process.env.ADMIN_PASSWORD || "admin@1234";

    const [rows] = await db.execute(
        "SELECT id, role FROM users WHERE email = ? LIMIT 1",
        [email]
    );

    if (rows.length === 0) {
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            `INSERT INTO users (name, email, password, phone, role)
             VALUES (?, ?, ?, ?, 'admin')`,
            ["System Administrator", email, hashedPassword, null]
        );

        console.log(`Admin account created: ${email}`);
        return;
    }

    if (rows[0].role !== "admin") {
        await db.execute(
            "UPDATE users SET role = 'admin' WHERE id = ?",
            [rows[0].id]
        );
        console.log(`Admin role enabled for: ${email}`);
    }
}

async function startServer() {

    try {

        /* TEST DATABASE */

        await db.query(
            "SELECT 1"
        );


        console.log(
            "MySQL database connected."
        );

        await ensureAdminUser();


        /* START SERVER */

        app.listen(
            PORT,
            () => {

                console.log(
                    `Server running on http://localhost:${PORT}`
                );

            }
        );

    } catch (error) {

        console.error(
            "DATABASE CONNECTION FAILED:"
        );

        console.error(
            error.message
        );

        process.exit(1);
    }
}


startServer();