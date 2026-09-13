const express = require("express");

const app = express();

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
        reservation_id,
        parking_space_id,
        location,
        notification_type
    } = req.body;



    if (
        user_id === undefined ||
        reservation_id === undefined ||
        parking_space_id === undefined ||
        location === undefined ||
        notification_type === undefined
    ) {
        return res.status(400).json({
            error: "Missing required notification data"
        });
    }



    let message;

    if (notification_type === "reservation_confirmation") {

        message = `Reservation confirmed. Parking space ${location} has been reserved for user ${user_id}.`;

    } else if (notification_type === "availability") {

        message = `Parking space ${location} is currently available`;

    } else {
        message = "Parking notification generated.";
    }

    console.log("Notification:", message);


    res.status(200).json({
        message: "Notification setn successfully",
        user_id: user_id,
        reservation_id: reservation_id,
        parking_space_id: parking_space_id,
        notification_type: notification_type,
        notification: message
    });
});



const PORT = 3002;

app.listen(PORT, () => {
    console.log(
        `Notification service is running on http://localhost:${PORT}`
    );
});