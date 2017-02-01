var async = require("async");
var HttpStatus = require('http-status-codes');
var applicationStorage = require("core/application-storage.js");
var updateModel = require("updates/update-model.js");

/**
 * Insert new Guild Update
 * @param req
 * @param res
 */
module.exports.postUpdate = function (req, res) {
    var logger = applicationStorage.logger;

    async.waterfall([
        function (callback) {
            if (req.body.type === "character") {
                callback(null, "c");
            } else if (req.body.type === "guild") {
                callback(null, "g");
            } else {
                res.status(HttpStatus.BAD_REQUEST).send(HttpStatus.getStatusText(HttpStatus.BAD_REQUEST));
            }
        },
        function (type, callback) {
            updateModel.insert(type, req.body.region, req.body.realm, req.body.name, 10, function (error) {
                callback(error, type);
            });
        },
        function (type, callback) {
            updateModel.getCount(type, 10, function (error, count) {
                callback(error, count);
            });
        }
    ], function (error, count) {
        if (error) {
            logger.error(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR));
        } else {
            res.json({count: count});
        }
    });

};

