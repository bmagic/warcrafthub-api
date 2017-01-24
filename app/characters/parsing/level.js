var characterLevelsModel = require("characters/character-levels-model");
var applicationStorage = require("core/application-storage");
var async = require("async");

module.exports.parse = function (bnetCharacter, callback) {

    var logger = applicationStorage.logger;

    if (bnetCharacter.faction !== null) {
        async.series([
            function (callback) {
                characterLevelsModel.findOne(bnetCharacter.region, bnetCharacter.realm, bnetCharacter.name, function (error, character) {
                    if (character && character.level === bnetCharacter.level) {
                        logger.silly("Character level already exist, do nothing");
                        callback(true);
                    } else {
                        callback();
                    }
                });
            },
            function (callback) {
                characterLevelsModel.insertOne(bnetCharacter.region, bnetCharacter.realm, bnetCharacter.name, bnetCharacter.faction, function (error) {
                    logger.info("Insert level %s for %s/%s/%s",bnetCharacter.level,bnetCharacter.region,bnetCharacter.realm,bnetCharacter.name);
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
    }
    else {
        logger.warning("Faction error in bnet json")
        callback();
    }
};