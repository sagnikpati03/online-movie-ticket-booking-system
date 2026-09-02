const {
    verifyToken
} = require("../utils/jwt");


function authenticateToken(
    req,
    res,
    next
) {

    const authHeader =
        req.headers.authorization;


    if (!authHeader) {
        return res.status(401).json({
            message:
                "Authentication token is required."
        });
    }


    const parts =
        authHeader.split(" ");


    if (
        parts.length !== 2 ||
        parts[0] !== "Bearer"
    ) {
        return res.status(401).json({
            message:
                "Invalid authorization format."
        });
    }


    const token =
        parts[1];


    try {

        const decoded =
            verifyToken(token);


        req.user =
            decoded;


        next();

    } catch (error) {

        return res.status(401).json({
            message:
                "Invalid or expired token."
        });
    }
}


function requireAdmin(
    req,
    res,
    next
) {

    if (
        !req.user ||
        req.user.role !== "admin"
    ) {
        return res.status(403).json({
            message:
                "Admin access required."
        });
    }


    next();
}


function requireCustomer(
    req,
    res,
    next
) {

    if (
        !req.user ||
        req.user.role !== "customer"
    ) {
        return res.status(403).json({
            message:
                "Customer access required."
        });
    }


    next();
}


module.exports = {
    authenticateToken,
    requireAdmin,
    requireCustomer
};