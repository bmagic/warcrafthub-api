var async = require("async");
var bnetAPI = require("core/api/bnet");
var applicationStorage = require("core/application-storage");
var updateModel = require("updates/update-model");

module.exports.start = function () {
    var logger = applicationStorage.logger;
    var self = this;
    async.waterfall(
        [
            function (callback) {
                //Get the next character to update
                updateModel.getUpdate('c', function (error, characterUpdate) {
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
                bnetAPI.getCharacter(characterUpdate.region, characterUpdate.realm, characterUpdate.name, ["guild", "items", "progression", "talents", "achievements", "statistics", "challenge", "pvp", "reputation", "stats", "quests"], function (error, bnetCharacter) {
                    if (error) {
                        if (error.statusCode === 403) {
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
                var character = {region: bnetCharacter.region, realm: bnetCharacter.realm, name: bnetCharacter.name};
                require("characters/parsing/base").parse(bnetCharacter, character);
                require("characters/parsing/items").parse(bnetCharacter, character);
                require("characters/parsing/progression").parse(bnetCharacter, character);
                async.parallel({
                    warcraftlogs: function (callback) {
                        require("characters/parsing/warcraftlogs").parse(bnetCharacter, function (error, warcraftlogs) {
                            if (error) logger.error(error.message);
                            callback(null, warcraftlogs);
                        });
                    }
                }, function (error, result) {
                    character.warcraftlogs = result.warcraftlogs;
                    callback(null,bnetCharacter,character);
                })
            },
            function (bnetCharacter, character, callback) {
                var collection = applicationStorage.mongo.collection("characters");
                collection.updateOne({
                        region: bnetCharacter.region,
                        realm: bnetCharacter.realm,
                        name: bnetCharacter.name
                    }, {
                        $set: character
                    }, {upsert: true},
                    function (error) {
                        logger.verbose("Insert character %s/%s/%s", bnetCharacter.region, bnetCharacter.realm, bnetCharacter.name);
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



