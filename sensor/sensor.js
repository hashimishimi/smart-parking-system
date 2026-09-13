const mqtt = require("mqtt");

const client = mqtt.connect("mqtt://localhost:1883");


const parkingSpaces = [
    { sensor_id: 1, parking_space_id: 1, location: "A01" },
    { sensor_id: 2, parking_space_id: 2, location: "A02" },
    { sensor_id: 3, parking_space_id: 3, location: "A03" },
    { sensor_id: 4, parking_space_id: 4, location: "A04" },
    { sensor_id: 5, parking_space_id: 5, location: "A05" },
    { sensor_id: 6, parking_space_id: 6, location: "B01" },
    { sensor_id: 7, parking_space_id: 7, location: "B02" },
    { sensor_id: 8, parking_space_id: 8, location: "B03" },
    { sensor_id: 9, parking_space_id: 9, location: "B04" },
    { sensor_id: 10, parking_space_id: 10, location: "B05" }
];


client.on("connect", () => {
    console.log("Connected to MQTT broker");

    setInterval(() => {
        const space = parkingSpaces[Math.floor(Math.random() * parkingSpaces.length)];

        const occupied = Math.random() < 0.5;

        const sensorData = {
            sensor_id: space.sensor_id,
            parking_space_id: space.parking_space_id,
            location: space.location,
            occupancy_status: occupied,
            timestamp: new Date().toISOString()
        };

        const message = JSON.stringify(sensorData);

        client.publish("smartparking/sensors", message);

        console.log("Sensor event:", sensorData);

    }, 5000)
});

client.on("error", (error) => {
    console.error("MQTT connection error:", error);
});