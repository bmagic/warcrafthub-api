var async = require("async");
var bnetAPI = require("core/api/bnet");
var applicationStorage = require("core/application-storage");

module.exports.start = function () {
    var logger = applicationStorage.logger;
    var self = this;
    async.waterfall(
        [
            function (callback) {
                //Get next character to update
                var nextUpdate = {region: "eu", realm: "Archimonde", name: "Bmagic"};
                logger.info('Character %s/%s/%s parsing started', nextUpdate.region, nextUpdate.realm, nextUpdate.name);
                callback(null, nextUpdate);
            },
            function (nextUpdate, callback) {
                bnetAPI.getCharacter(nextUpdate.region, nextUpdate.realm, nextUpdate.name, [], function (error, bnetCharacter) {
                    callback(error, Object.freeze(bnetCharacter));
                })
            },
            function (bnetCharacter, callback) {
                async.parallel([
                    function (callback) {
                        require("characters/parsing/faction").parse(bnetCharacter, function (error) {
                            callback(error);
                        });
                    }
                ], function (error) {
                    callback(error);
                })
            }
        ], function (error) {
            if (error) {
                logger.error(error.message);
            }

            self.start();
        }
    );
};



