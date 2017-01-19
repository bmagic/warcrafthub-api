"use strict";

var async = require("async");
var applicationStorage = require("core/application-storage.js");
var updateModel = require("updates/update-model.js");

/**
 * Return the next update in list with higher priority
 * @param type
 * @param callback
 */
module.exports.getNextUpdate = function (type, callback) {
    var config = applicationStorage.config;

    /** @namespace config.priorities */
    async.eachSeries(config.priorities, function (priority, callback) {
        updateModel.getUpdate(type, priority, function (error, result) {
            if (error) {
                return callback({error:error});
            } else if (result) {
                return callback({result: result});
            } else {
                callback()
            }
        });
    }, function (result) {
        if (!result) {
            return callback();
        } else if (result.error) {
            return callback(result.error);
        } else {
            callback(null, result.result);
        }
    });
};