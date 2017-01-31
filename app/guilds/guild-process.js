var async = require("async");
var bnetAPI = require("core/api/bnet");
var applicationStorage = require("core/application-storage");
var updateUtils = require("updates/update-utils");
var updateModel = require("updates/update-model");

module.exports.start = function () {
    var logger = applicationStorage.logger;
    var self = this;
    async.waterfall(
        [
            function (callback) {
                //Get the next guild to update
                updateUtils.getNextUpdate('g', function (error, guildUpdate) {
                    if (error) {
                        callback(error);
                    } else if (guildUpdate) {
                        logger.info('Guild %s/%s/%s parsing started', guildUpdate.region, guildUpdate.realm, guildUpdate.name);
                        callback(error, guildUpdate);
                    } else {
                        logger.info('No guild to update, waiting 10 sec');
                        setTimeout(function () {
                            callback(true)
                        }, 10000);
                    }
                });
            },
            function (guildUpdate, callback) {
                //Get the guild from Bnet
                bnetAPI.getGuild(guildUpdate.region, guildUpdate.realm, guildUpdate.name, ["members"], function (error, bnetGuild) {
                    if (error) {
                        if (error.statusCode == 403) {
                            logger.info("Bnet Api Deny, waiting 60 sec");
                            updateModel.insert("g", bnetGuild.region, bnetGuild.realm, bnetGuild.name, bnetGuild.priority, function () {
                                setTimeout(function () {
                                    callback(true);
                                }, 60000);
                            });
                        } else {
                            callback(error);
                        }
                    } else {
                        if (bnetGuild && bnetGuild.realm && bnetGuild.name) {
                            bnetGuild.region = guildUpdate.region;
                            callback(error, Object.freeze(bnetGuild));
                        } else {
                            logger.warn("This guild is inactive, skip it");
                            callback(true);
                        }
                    }
                });
            },
            function (bnetGuild, callback) {
                //Do stuff witch bnetGuild
                async.parallel([
                    function (callback) {
                        require("guilds/parsing/update-members").parse(bnetGuild, function (error) {
                            callback(error);
                        });
                    }
                ], function (error) {
                    callback(error);
                })
            }
        ], function (error) {
            if (error && error != true) {
                logger.error(error.message);
            }

            self.start();
        }
    );
};



