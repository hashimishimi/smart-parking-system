const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.get("/config.js", (req, res) => {

    res.type("application/javascript");

    res.send(`
        window.__CONFIG__ = {
            SENSOR_API_URL: "${process.env.SENSOR_API_URL || ""}",
            ALLOCATION_API_URL: "${process.env.ALLOCATION_API_URL || ""}",
            ANALYTICS_API_URL: "${process.env.ANALYTICS_API_URL || ""}",
            NOTIFICATION_API_URL: "${process.env.NOTIFICATION_API_URL || ""}"
        };
    `);
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
    res.json({
        service: "Dashboard",
        status: "running"
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Parking Dashboard listening on port ${PORT}`);
});