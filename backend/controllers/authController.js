const bcrypt = require("bcrypt");

const {
    findUserByEmail,
    createUser
} = require("../models/userModel");

const {
    generateToken
} = require("../utils/jwt");


/* =========================
   REGISTER
   POST /api/auth/register
========================= */

async function register(req, res) {
    try {

        const {
            name,
            email,
            password,
            phone
        } = req.body;


        /* VALIDATION */

        if (
            !name ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                message:
                    "Name, email and password are required."
            });
        }


        if (password.length < 8) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters."
            });
        }


        const normalizedEmail =
            email.trim().toLowerCase();


        /* CHECK EXISTING USER */

        const existingUser =
            await findUserByEmail(
                normalizedEmail
            );


        if (existingUser) {
            return res.status(409).json({
                message:
                    "An account with this email already exists."
            });
        }


        /* HASH PASSWORD */

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        /* CREATE CUSTOMER */

        const userId =
            await createUser({
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                phone: phone
                    ? phone.trim()
                    : null
            });


        return res.status(201).json({
            message:
                "Registration successful.",

            user: {
                id: userId,
                name: name.trim(),
                email: normalizedEmail,
                role: "customer"
            }
        });

    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Internal server error."
        });
    }
}


/* =========================
   LOGIN
   POST /api/auth/login
========================= */

async function login(req, res) {
    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {
            return res.status(400).json({
                message:
                    "Email and password are required."
            });
        }


        const normalizedEmail =
            email.trim().toLowerCase();


        /* FIND USER */

        const user =
            await findUserByEmail(
                normalizedEmail
            );


        if (!user) {
            return res.status(401).json({
                message:
                    "Invalid email or password."
            });
        }


        /* CHECK PASSWORD */

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {
            return res.status(401).json({
                message:
                    "Invalid email or password."
            });
        }


        /* CREATE JWT */

        const token =
            generateToken(user);


        return res.status(200).json({

            message:
                "Login successful.",

            token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }

        });

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Internal server error."
        });
    }
}


/* =========================
   LOGOUT
   POST /api/auth/logout
========================= */

function logout(req, res) {

    return res.status(200).json({
        message:
            "Logout successful."
    });

}


module.exports = {
    register,
    login,
    logout
};