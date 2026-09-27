const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

const SENSOR_API_URL = process.env.SENSOR_API_URL;
const ALLOCATION_API_URL = process.env.ALLOCATION_API_URL;
const ANALYTICS_API_URL = process.env.ANALYTICS_API_URL;
const NOTIFICATION_API_URL = process.env.NOTIFICATION_API_URL;

async function proxyRequest(url, options = {}) {
    const response = await fetch(url, options);

    const text = await response.text();

    let data;

    try {
        data = JSON.parse(text);
    } catch {
        data = { error: text };
    }

    return {
        status: response.status,
        data
    };
}

app.get("/config.js", (req, res) => {
    res.type("application/javascript");

    res.send(`
        window.__CONFIG__ = {
            SENSOR_API_URL: "/api/sensor",
            ALLOCATION_API_URL: "/api/allocation",
            ANALYTICS_API_URL: "/api/analytics",
            NOTIFICATION_API_URL: "/api/notification"
        };
    `);
});

/* ---------------- SENSOR ---------------- */

app.get("/api/sensor/spaces", async (req, res) => {
    try {
        const result = await proxyRequest(
            `${SENSOR_API_URL}/api/spaces`
        );

        res.status(result.status).json(result.data);
    } catch (error) {
        console.error("Sensor proxy error:", error);

        res.status(502).json({
            error: "Sensor Service unavailable"
        });
    }
});

app.post("/api/sensor", async (req, res) => {
    try {
        const result = await proxyRequest(
            `${SENSOR_API_URL}/api/sensor`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(req.body)
            }
        );

        res.status(result.status).json(result.data);
    } catch (error) {
        console.error("Sensor proxy error:", error);

        res.status(502).json({
            error: "Sensor Service unavailable"
        });
    }
});

/* ---------------- ALLOCATION ---------------- */

app.post("/api/allocation/allocate", async (req, res) => {
    try {
        const result = await proxyRequest(
            `${ALLOCATION_API_URL}/api/allocate`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(req.body)
            }
        );

        res.status(result.status).json(result.data);
    } catch (error) {
        console.error("Allocation proxy error:", error);

        res.status(502).json({
            error: "Allocation Service unavailable"
        });
    }
});

/* ---------------- ANALYTICS ---------------- */

app.get("/api/analytics/occupancy", async (req, res) => {
    try {
        const result = await proxyRequest(
            `${ANALYTICS_API_URL}/api/analytics/occupancy`
        );

        res.status(result.status).json(result.data);
    } catch (error) {
        console.error("Analytics proxy error:", error);

        res.status(502).json({
            error: "Analytics Service unavailable"
        });
    }
});

app.get("/api/analytics/reservations", async (req, res) => {
    try {
        const result = await proxyRequest(
            `${ANALYTICS_API_URL}/api/analytics/reservations`
        );

        res.status(result.status).json(result.data);
    } catch (error) {
        console.error("Analytics proxy error:", error);

        res.status(502).json({
            error: "Analytics Service unavailable"
        });
    }
});

/* ---------------- NOTIFICATION ---------------- */

app.post("/api/notification/notify", async (req, res) => {
    try {
        const result = await proxyRequest(
            `${NOTIFICATION_API_URL}/api/notify`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(req.body)
            }
        );

        res.status(result.status).json(result.data);
    } catch (error) {
        console.error("Notification proxy error:", error);

        res.status(502).json({
            error: "Notification Service unavailable"
        });
    }
});


/* ---------------- HEALTH ---------------- */

app.get("/health", (req, res) => {
    res.json({
        service: "Dashboard",
        status: "running"
    });
});

/* ---------------- STATIC DASHBOARD ---------------- */

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Parking Dashboard listening on port ${PORT}`);
});