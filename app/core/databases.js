var applicationStorage = require("core/application-storage");
var mongo = require('mongodb').MongoClient;
var redis = require("redis");
var async = require('async');

module.exports.start = function (callback) {
    var self = this;
    async.parallel([
        function (callback) {
            self.startMongo(function (error) {
                callback(error);
            });
        },
        function (callback) {
            self.startRedis(function (error) {
                callback(error);
            });
        }
    ], function (error) {
        callback(error);
    });
};

module.exports.startMongo = function (callback) {
    mongo.connect(applicationStorage.config.database.mongo, function (error, db) {
        applicationStorage.logger.info("Mongo connected");
        applicationStorage.mongo = db;
        callback(error);
    });
};

module.exports.startRedis = function (callback) {
    var db = redis.createClient(applicationStorage.config.database.redis);
    db.on("error", function (error) {
        callback(error);
    });

    db.on("ready", function () {
        applicationStorage.logger.info("Redis ready");
        applicationStorage.redis = db;
        callback();
    });
}