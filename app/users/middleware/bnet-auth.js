"use strict"

//Module dependencies
var async = require("async");
var passport = require("passport");
var BnetStrategy = require("passport-bnet").Strategy;
var applicationStorage = require("core/application-storage.js");
var userUtils = require("users/user-utils.js");

var config = applicationStorage.config;
var logger = applicationStorage.logger;

//Define Battlenet Oauth authentication strategy.
passport.use('bnet', new BnetStrategy({
        clientID: config.bnet.clientID,
        clientSecret: config.bnet.clientSecret,
        scope: "wow.profile",
        region: "us",
        callbackURL: config.bnet.callbackURL
    },
    /** @namespace profile.battletag */
    function (accessToken, refreshToken, profile, done) {
        logger.verbose("%s connected", profile.battletag);

        var collection = applicationStorage.mongo.collection("users");


        async.waterfall([
            function (callback) {
                collection.findOne({id: profile.id}, function (error, user) {
                    callback(error, user);
                });
            },
            function (user, callback) {
                if (user && user.id) {
                    user.battleTag = profile.battletag;
                    user.accessToken = accessToken;
                } else {
                    user = {id: profile.id, battleTag: profile.battletag, accessToken: accessToken};
                }
                collection.updateOne({id: user.id}, user, {upsert: true}, function (error) {
                    callback(error, user);
                });

            }
        ], function (error, user) {
            if (error) {
                logger.error(error.message);
                return done(null, false);
            }
            //Set user's id on guild ad
            // userService.updateGuildsId(user.id);

            //Set user's id on characters ad
            // userService.updateCharactersId(user.id);
            done(null, user);
        });
    }
));

// In order to support login sessions, Passport serialize and
// deserialize user instances to and from the session.
// Only the user ID is serialized to the session.
// noinspection JSUnresolvedFunction
passport.serializeUser(function (user, done) {
    logger.silly("serializeUser id:%s battleTag:%s accessToken:%s", user.id, user.battleTag, user.accessToken);
    done(null, user.id);
});

// When subsequent requests are received, the ID is used to find
// the user, which will be restored to req.user.
// noinspection JSUnresolvedFunction
passport.deserializeUser(function (id, done) {
    logger.silly("deserializeUser for id:%s", id);
    var collection = applicationStorage.mongo.collection("users");
    collection.findOne({id: id}, function (error, user) {
        if (user) {
            delete user.accessToken;
            done(null, user);
        } else {
            done(null, false);
        }
    });
});

