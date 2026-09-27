const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        service: "Notification Service",
        status: "running"
    });
});

app.post("/api/notify", (req, res) => {

    const {
        user_id,
        message
    } = req.body;

    if (!user_id || !message) {
        return res.status(400).json({
            error: "user_id and message are required"
        });
    }

    console.log(
        `Notification for user ${user_id}: ${message}`
    );

    res.json({
        message: "Notification generated successfully",
        user_id,
        notification: message
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Notification Service listening on port ${PORT}`);
});