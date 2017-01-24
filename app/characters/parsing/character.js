var characterModel = require("characters/character-model");
var applicationStorage = require("core/application-storage");
var async = require("async");

module.exports.parse = function (bnetCharacter, callback) {

    var logger = applicationStorage.logger;

    async.series([
        function (callback) {
            characterModel.findOne(bnetCharacter.region, bnetCharacter.realm, bnetCharacter.name, function (error, character) {
                if (character) {
                    logger.silly("Character already exist, do nothing.");
                    callback(true);
                } else {
                    callback();
                }
            });
        },
        function (callback) {
            characterModel.insertOne(bnetCharacter.region, bnetCharacter.realm, bnetCharacter.name, function (error) {
                logger.info("Insert character %s/%s/%s", bnetCharacter.region, bnetCharacter.realm, bnetCharacter.name)
                callback(error);
            })
        }
    ], function (error) {
        if (error === true) {
            callback()
        } else {
            callback(error)
        }
    });


};