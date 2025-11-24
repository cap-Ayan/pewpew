const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: false, // Changed to false to allow image-only messages
    },
    sender: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    channel: {
        type: String,
        default: "general",
    },
    attachment: {
        url: String,
        type: { type: String },
        name: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Message", messageSchema);
