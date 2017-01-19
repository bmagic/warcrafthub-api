module.exports = Object.freeze({
    port: 3000,
    session_secret: "justbetweenyouandme",
    database: {
        mongo: "mongodb://localhost/acdh",
        redis: "redis://localhost"
    },
    logger: {
        folder: "logs",
        level: "debug"
    },
    bnet: {
        clientID: "yourBnetClientID"
    },
    priorities: [0, 5, 10]
});