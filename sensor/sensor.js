const mqtt = require("mqtt");

const MQTT_BROKER =
    process.env.MQTT_BROKER ||
    "mqtt://localhost:1883";

const TOPIC =
    process.env.MQTT_TOPIC ||
    "smartparking/sensors";

const client =
    mqtt.connect(MQTT_BROKER);


const spaces =
    Array.from(
        { length: 10 },
        (_, i) => i + 1
    );


client.on("connect", () => {

    console.log(
        `Connected to MQTT broker: ${MQTT_BROKER}`
    );


    setInterval(() => {

        const parkingSpaceId =
            spaces[
                Math.floor(
                    Math.random() *
                    spaces.length
                )
            ];


        const occupancyStatus =
            Math.random() > 0.5;


        const payload = {

            sensor_id:
                `S${String(parkingSpaceId)
                    .padStart(2, "0")}`,

            parking_space_id:
                parkingSpaceId,

            location:
                `SPACE-${parkingSpaceId}`,

            occupancy_status:
                occupancyStatus,

            timestamp:
                new Date().toISOString()
        };


        client.publish(
            TOPIC,
            JSON.stringify(payload)
        );


        console.log(
            "Published:",
            payload
        );

    }, 5000);

});


client.on("error", error => {

    console.error(
        "MQTT error:",
        error.message
    );

});