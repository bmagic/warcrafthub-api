// Set module root directory and define a custom require function
require('app-module-path').addPath(__dirname + '/../app');


// Module dependencies
var async = require('async');
var config = require("core/config");
var logger = require("core/logger");
var databases = require("core/databases");
var characterProcess = require("characters/character-process");


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
        databases.start(function (error) {
            callback(error);
        });
    },
    //Start the process
    function (callback) {
        characterProcess.start(function(error){
            callback(error);
        });
    }
], function (error) {
    if (error)
        console.log(error);
});