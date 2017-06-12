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

    //Concat priority with timestamp
    priority = priority + '' + new Date().getTime();

    //Create object to insert
    var value = JSON.stringify({region: region, realm: realm, name: name, priority: priority});

    //Create or update auctionUpdate
    redis.zadd(type, priority, value, function (error) {
        callback(error);
    });
};


/**
 * Return the next update in list with a priority
 * @param type
 * @param callback
 */
module.exports.getUpdate = function (type, callback) {
    var redis = applicationStorage.redis;


    redis.watch(type);
    async.waterfall([
        function (callback) {
            redis.zrange(type, 0, 0, function (error, value) {
                if (value.length !== 0) {
                    callback(error, value);
                } else {
                    callback(true);
                }

            });
        },
        function (value, callback) {
            var multi = redis.multi();
            multi.zrem(type, value);
            multi.exec(function (error) {
                callback(error, JSON.parse(value));
            });
        }

    ], function (error, update) {
        if (error === true) {
            callback();
        } else {
            callback(error, update);
        }
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
