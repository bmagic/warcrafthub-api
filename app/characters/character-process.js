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
                //Get the next character to update
                updateUtils.getNextUpdate('c', function (error, characterUpdate) {
                    if (error) {
                        callback(error);
                    } else if (characterUpdate) {
                        logger.info('Character %s/%s/%s parsing started', characterUpdate.region, characterUpdate.realm, characterUpdate.name);
                        callback(error, characterUpdate);
                    } else {
                        logger.info('No character to update, waiting 10 sec');
                        setTimeout(function () {
                            callback(true)
                        }, 10000);
                    }
                });
            },
            function (characterUpdate, callback) {
                //Get the character from Bnet
                bnetAPI.getCharacter(characterUpdate.region, characterUpdate.realm, characterUpdate.name, ["items"], function (error, bnetCharacter) {
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
                        if (bnetCharacter && bnetCharacter.realm && bnetCharacter.name) {
                            bnetCharacter.region = characterUpdate.region;
                            callback(error, Object.freeze(bnetCharacter));
                        } else {
                            logger.warn("This character is inactive, skip it");
                            callback(true);
                        }
                    }
                });
            },
            function (bnetCharacter, callback) {
                //Do stuff witch bnetCharacter
                async.parallel([
                    function (callback) {
                        require("characters/parsing/character").parse(bnetCharacter, function (error) {
                            callback(error);
                        });
                    },
                    function (callback) {
                        require("characters/parsing/level").parse(bnetCharacter, function (error) {
                            callback(error);
                        });
                    },
                    function (callback) {
                        require("characters/parsing/average-item-level").parse(bnetCharacter, function (error) {
                            callback(error);
                        });
                    },
                    function (callback) {
                        require("characters/parsing/average-item-level-equipped").parse(bnetCharacter, function (error) {
                            callback(error);
                        });
                    },
                    function (callback) {
                        require("characters/parsing/items").parse(bnetCharacter, function (error) {
                            callback(error);
                        });
                    },
                    function (callback) {
                        require("characters/parsing/thumbnail").parse(bnetCharacter, function (error) {
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



