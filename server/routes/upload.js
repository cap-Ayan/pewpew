const router = require("express").Router();
const multer = require("multer");
const path = require("path");

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Upload endpoint
router.post("/", upload.single("file"), (req, res) => {
    try {
        // Use SERVER_URL from environment, or default to localhost for development
        const baseUrl = process.env.SERVER_URL || "http://localhost:8000";
        const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
        res.status(200).json({ url: fileUrl, type: req.file.mimetype, name: req.file.originalname });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
