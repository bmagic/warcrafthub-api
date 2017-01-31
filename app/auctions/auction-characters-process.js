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
                //Get next auction to update
                updateUtils.getNextUpdate('a', function (error, auctionUpdate) {
                    if (error) {
                        callback(error);
                    } else if (auctionUpdate) {
                        logger.info("Update auction with owner %s/%s/%s", auctionUpdate.region, auctionUpdate.realm, auctionUpdate.name);
                        callback(error, auctionUpdate);

                    } else {
                        //Guild update is empty
                        logger.info("No auction to update, waiting 1 min");
                        setTimeout(function () {
                            callback(true);
                        }, 60000);
                    }
                });
            },
            function (characterUpdate, callback) {
                //Get the character from Bnet
                bnetAPI.getCharacter(characterUpdate.region, characterUpdate.realm, characterUpdate.name, ["guild"], function (error, bnetCharacter) {
                    if (error) {
                        if (error.statusCode == 403) {
                            logger.info("Bnet Api Deny, waiting 60 sec");
                            updateModel.insert("c", characterUpdate.region, characterUpdate.realm, characterUpdate.name, characterUpdate.priority, function () {
                                setTimeout(function () {
                                    callback(true);
                                }, 60000);
                            });
                        } else {
                            callback(error);
                        }
                    } else {
                        if (bnetCharacter && bnetCharacter.guild && bnetCharacter.guild.name) {
                            bnetCharacter.region = characterUpdate.region;
                            callback(error, Object.freeze(bnetCharacter));
                        } else if (bnetCharacter) {
                            logger.warn("This character has no guild, skip it");
                            callback(true);
                        } else {
                            logger.warn("This character is inactive, skip it");
                            callback(true);
                        }
                    }
                });
            },
            function (bnetCharacter, callback) {
                updateModel.insert("g", bnetCharacter.region, bnetCharacter.realm, bnetCharacter.guild.name, 0, function (error) {
                    logger.info("Insert guild %s/%s/%s to update ", bnetCharacter.region, bnetCharacter.realm, bnetCharacter.guild.name);
                    callback(error);
                });
            }
        ], function (error) {
            if (error && error != true) {
                logger.error(error.message);
            }

            self.start();
        }
    );
};



