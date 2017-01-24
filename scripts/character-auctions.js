// Set module root directory and define a custom require function
require('app-module-path').addPath(__dirname + '/../app');


// Module dependencies
var async = require('async');
var config = require("core/config");
var logger = require("core/logger");
var databases = require("core/databases");
var auctionCharactersProcess = require("auctions/auction-characters-process");
var auctionFeederProcess = require("auctions/auction-feeder-process");

async.waterfall([
    //Initialize the logger
    function (callback) {
        config.load(function (error) {
            callback(error);
        });
    },
    //Initialize the logger
    function (callback) {
        logger.start(function (error) {
            callback(error);
        });
    },
    //Connect to database
    function (callback) {
        databases.startRedis(function (error) {
            callback(error);
        });
    },
    //Start the process
    function (callback) {
        async.parallel([
            function (callback) {
                auctionCharactersProcess.start(function (error) {
                    callback(error);
                });
            },
            function (callback) {
                auctionFeederProcess.start(function (error) {
                    callback(error);
                });
            }
        ], function (error) {
            callback(error);
        });
    }
], function (error) {
    if (error)
        console.log(error);
});