"use strict";

//Load dependencies
var async = require("async");
var applicationStorage = require("core/application-storage");

/**
 * Insert an update into list
 * @param type
 * @param region
 * @param realm
 * @param name
 * @param priority
 * @param callback
 */
module.exports.insert = function (type, region, realm, name, priority, callback) {
    var redis = applicationStorage.redis;

    //Create object to insert
    var value = JSON.stringify({region: region, realm: realm, name: name, priority: priority});

    //Create or update auctionUpdate
    redis.lpush(type + "_" + priority, value, function (error) {
        callback(error);
    });
};

/**
 * Return the next update in list with a priority
 * @param type
 * @param priority
 * @param callback
 */
module.exports.getUpdate = function (type, priority, callback) {
    var redis = applicationStorage.redis;
    async.waterfall([
        function (callback) {
            //Get last value of the list
            redis.rpop(type + "_" + priority, function (error, value) {
                callback(error, value)
            });
        },
        function (value, callback) {
            //Remove all similar value in the list
            if (value === null) { return callback(null, value); }
            redis.lrem(type + "_" + priority, 0, value, function (error) {
                callback(error, value)
            });
        }
    ], function (error, value) {
        callback(error, JSON.parse(value));
    });
};

/**
 * Return the number of updates in list
 * @param type
 * @param priority
 * @param callback
 */
module.exports.getCount = function (type, priority, callback) {
    var redis = applicationStorage.redis;
    redis.llen(type + "_" + priority, function (error, value) {
        callback(error, value);
    });
};

