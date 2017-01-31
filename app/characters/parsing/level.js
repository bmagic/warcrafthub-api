var applicationStorage = require("core/application-storage");
var async = require("async");

module.exports.parse = function (bnetCharacter, callback) {

    var logger = applicationStorage.logger;

    if (bnetCharacter.level !== undefined) {
        var collection = applicationStorage.mongo.collection("character_levels");
        async.series([
            function (callback) {

                collection.findOne({
                    region: bnetCharacter.region,
                    realm: bnetCharacter.realm,
                    name: bnetCharacter.name,
                    level: bnetCharacter.level
                }, {_id: 1}, {sort: [["_id", "desc"]]}, function (error, character) {
                    if (character) {
                        logger.silly("Character level already exist, do nothing");
                        callback(true);
                    } else {
                        callback();
                    }
                });
            },
            function (callback) {
                collection.insertOne({
                    region: bnetCharacter.region,
                    realm: bnetCharacter.realm,
                    name: bnetCharacter.name,
                    level: bnetCharacter.level
                }, function (error) {
                    logger.info("Insert level %s for %s/%s/%s", bnetCharacter.level, bnetCharacter.region, bnetCharacter.realm, bnetCharacter.name);
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
        logger.warn("Level missing in bnet json")
        callback();
    }
};