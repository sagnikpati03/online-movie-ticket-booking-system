const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const posterDirectory = path.join(__dirname, "..", "uploads", "posters");
fs.mkdirSync(posterDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, posterDirectory),
    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        callback(null, `poster-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${extension}`);
    }
});

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

module.exports = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, callback) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            return callback(Object.assign(new Error("Poster must be a JPG, PNG, WEBP, or GIF image."), { status: 400 }));
        }
        callback(null, true);
    }
});
