module.exports = Object.freeze({
    port: 3000,
    session_secret: "justbetweenyouandme",
    database: {
        mongo: "mongodb://localhost/warcrafthub",
        redis: "redis://localhost"
    },
    logger: {
        folder: "logs",
        level: "debug"
    },
    bnet: {
        clientID: "yourBnetClientID",
        clientSecret: "yourBnetClientSecret",
        callbackURL: "https://[BASEURL]/api/v1/users/auth/bnet/callback"
    },
    warcraftLogs: {
        api_key: "warcraftLogsApiKey"
    },
    priorities: [10, 5, 0],
    regions: ["us", "eu", "tw", "kr"],
    min_level: 110,
    progress: {
        difficulties: [
            "normal",
            "heroic",
            "mythic"
        ],
        raids: [
            {
                name: "The Emerald Nightmare",
                bosses: [
                    "Nythendra",
                    "Elerethe Renferal",
                    "Il'gynoth, Heart of Corruption",
                    "Ursoc",
                    "Dragons of Nightmare",
                    "Cenarius",
                    "Xavius"
                ]
            }
        ]
    }
});