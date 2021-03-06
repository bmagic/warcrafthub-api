//Load dependencies
var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require("express");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var mongoStore = require("connect-mongo")(session);
var passport = require("passport");
var compression = require('compression');
var HttpStatus = require('http-status-codes');
var applicationStorage = require("core/application-storage");

module.exports.start = function (callback) {

    var app = express();

    var config = applicationStorage.config;
    var logger = applicationStorage.logger;


    var server;
    if (applicationStorage.env == 'dev') {
        //Start the server in HTTPS for dev
        server = https.createServer({key: fs.readFileSync('./app/config/dev-cert/server.key', 'utf8'), cert: fs.readFileSync('./app/config/dev-cert/server.crt', 'utf8')}, app);
    }
    else {
        //Start the server in HTTP (reverse proxy make the SSL)
        server = http.createServer(app);
    }



    //Create sessionStore inside Mongodb
    var sessionStore = new mongoStore({db: applicationStorage.mongo});

    app.use(compression({threshold: 0}));

    //Update Session store with opened database connection
    //Allowed server to restart without loosing any session
    //noinspection JSUnresolvedVariable
    app.use(session({
        key: 'whub.sid',
        cookie: {maxAge: 3600000 * 24 * 14},
        secret: config.session_secret,
        store: sessionStore,
        saveUninitialized: true,
        resave: true
    }));

    app.use(cookieParser());

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    //noinspection JSUnresolvedFunction
    app.use(passport.initialize());
    //noinspection JSUnresolvedFunction
    app.use(passport.session());

    app.use(function (req, res, next) {
        if (req.headers.origin) {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, CONNECT');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
            res.setHeader('Access-Control-Allow-Credentials', true);
        }

        if ('OPTIONS' === req.method) {
            res.send(200);
        } else {
            next();
        }
    });


    //Log all other request and send 404
    app.use(function (req, res, next) {
        //noinspection JSUnresolvedVariable
        if (applicationStorage.env == 'dev') {
            logger.info("ip:%s method:%s path:%s params:%s body:%s query:%s", req.headers['x-forwarded-for'] || req.connection.remoteAddress, req.method, req.path, JSON.stringify(req.params), JSON.stringify(req.body), JSON.stringify(req.query));
        } else {
            logger.info("ip:%s method:%s ", req.headers['x-forwarded-for'] || req.connection.remoteAddress, req.method, req.path);
        }
        next();
    });

    //Initialize api v1 routes
    app.use('/api/v1/users', require('users/routes.js'));
    app.use('/api/v1/characters', require("characters/routes.js"));
    app.use('/api/v1/updates', require("updates/routes.js"));

    //Log all other request and send 404
    app.use(function (req, res) {
        logger.error("Error 404 on request %s", req.url);
        res.status(HttpStatus.NOT_FOUND).json({
            status: HttpStatus.NOT_FOUND,
            message: HttpStatus.getStatusText(HttpStatus.NOT_FOUND)
        });
    });

    server.listen(config.port, function () {
        var protocol = server.key ? "HTTPS" : "HTTP";

        applicationStorage.logger.info("Server "+protocol+" listening on port %s", config.port);
        callback();
    });
};


