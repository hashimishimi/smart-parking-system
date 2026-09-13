const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../../.env")
});


const app = express();

app.use(express.json());


const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "smart_parking"
});


app.get("/", (req, res) => {
    res.json({
        service: "Parking Allocation Service",
        status: "running"
    });
});


app.post("/api/allocate", async (req, res) => {

    try {
        const { user_id } = req.body;

        if (user_id === undefined) {
            return res.status(400).json({
                error: "User_id is required"
            });
        }

        const [spaces] = await db.execute(
            `SELECT parking_space_id, location
            FROM ParkingSpaces
            WHERE occupancy_status = 0
            ORDER BY parking_space_id
            LIMIT 1`
        );

        if (spaces.length === 0) {
            return res.status(409).json({
                error: "No parking spaces available"
            });
        }


        const parkingSpace = spaces[0];


        const [result] = await db.execute(
            `INSERT INTO Reservations 
            (user_id, parking_space_id, reservation_status, entry_time) 
            VALUES (?, ?, ?, NOW())`,

            [
                user_id, parkingSpace.parking_space_id, "Reserved"
            ]
        );


        await db.execute(
            `UPDATE ParkingSpaces SET occupancy_status = 1 WHERE parking_space_id = ?`,
            [
                parkingSpace.parking_space_id
            ]
        );



        console.log(
            `Parking space ${parkingSpace.location} reserved for user ${user_id}`
        );



        res.status(201).json({
            message: "Parking space reserved successfully",
            reservation_id: result.insertId,
            user_id: user_id,
            parking_space_id: parkingSpace.parking_space_id,
            location: parkingSpace.location,
            reservation_status: "Reserved"
        });


    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            error: "Failed to allocate parking space"
        });
    }
});



const PORT = 3001;

app.listen(PORT, () => {
    console.log(
        `Parking Allocation Service is running on http://localhost:${PORT}`
    );
});