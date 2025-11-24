const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ username });
        if (userExists) return res.status(400).json("Username already taken");

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new User({
            username,
            password: hashedPassword,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`, // Generate avatar based on username
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(500).json(err);
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json("User not found");

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json("Wrong password");

        // Create token
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || "secretkey", {
            expiresIn: "1d",
        });

        // Return user info (excluding password) and token
        const { password: _, ...userInfo } = user._doc;
        res.status(200).json({ ...userInfo, token });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
