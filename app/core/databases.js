var applicationStorage = require("core/application-storage");
var mongo = require('mongodb').MongoClient;
var async = require('async');

module.exports.start = function (callback) {
    var self = this;
    async.parallel([
        function (callback) {
            self.startMongo(function (error) {
                callback(error);
            });
        }
    ], function (error) {
        callback(error);
    });
};

module.exports.startMongo = function (callback) {
    mongo.connect(applicationStorage.config.database, function (error, db) {
        applicationStorage.logger.info("Mongo connected");
        applicationStorage.mongo = db;
        callback(error);
    });
};