module.exports = Object.freeze({
    port: 3000,
    session_secret: "justbetweenyouandme",
    database: "mongodb://localhost/acdh",
    logger: {
        folder: "logs",
        level: "debug"
    },
    bnet:{
        clientID:"yourBnetClientID"
    }
});