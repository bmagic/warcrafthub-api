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
    redis.zadd(type, priority + '' + new Date().getTime(), value, function (error) {
        callback(error);
    });
};

/**
 * Return the number of updates in list
 * @param type
 * @param callback
 */
module.exports.getCount = function (type, callback) {
    var redis = applicationStorage.redis;
    redis.zcount(type, "-inf", "+inf", function (error, value) {
        callback(error, value);
    });
};
