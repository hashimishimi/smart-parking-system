const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env")
});

const app = express();

app.use(express.json());


app.get("/", (req, res) => {
    res.json({
        service: "Sensor Service",
        status: "running"
    });
});


const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "smart_parking"
});



app.post("/api/sensor", async (req, res) => {
    try {
        const {
            sensor_id,
            parking_space_id,
            occupancy_status,
            timestamp
        } = req.body;


        if (
            sensor_id === undefined ||
            parking_space_id === undefined ||
            occupancy_status === undefined ||
            timestamp === undefined
        ) {
            return res.status(400).json({
                error: "Missing required sensor data"
            });
        }


        const mysqlTimestamp = new Date(timestamp)
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");


        await db.execute(
            `UPDATE ParkingSpaces
            SET occupancy_status = ?, last_updated = ?
            WHERE parking_space_id = ?`,
            [
                occupancy_status ? 1 : 0,
                mysqlTimestamp,
                parking_space_id
            ]
        );


        console.log(
            `Updated parking space ${parking_space_id}: ${
                occupancy_status ? "occupied" : "vacant"
            }`
        );


        res.json({
            message: "Sensor data processed successfully",
            parking_space_id: parking_space_id,
            occupancy_status: occupancy_status
        });


    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            error: "Failed to process sensor data"
        });
    }
});


const PORT = 3000;


app.listen(PORT, () => {
    console.log(`Sensor Service is running on http://localhost:${PORT}`);
});