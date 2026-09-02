require("dotenv").config();


const app =
    require("./app");

const db =
    require("./config/db");


const PORT =
    Number(process.env.PORT) || 5000;


async function startServer() {

    try {

        /* TEST DATABASE */

        await db.query(
            "SELECT 1"
        );


        console.log(
            "MySQL database connected."
        );


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