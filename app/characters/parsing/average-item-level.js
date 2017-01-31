var applicationStorage = require("core/application-storage");
var async = require("async");

module.exports.parse = function (bnetCharacter, callback) {

    var logger = applicationStorage.logger;

    if (bnetCharacter.items !== undefined && bnetCharacter.items.averageItemLevel !== undefined) {
        var collection = applicationStorage.mongo.collection("character_average_item_levels");
        async.series([
            function (callback) {
                collection.findOne({
                    region: bnetCharacter.region,
                    realm: bnetCharacter.realm,
                    name: bnetCharacter.name,
                    averageItemLevel: bnetCharacter.items.averageItemLevel
                }, {_id: 1}, {sort: [["_id", "desc"]]}, function (error, character) {
                    if (character) {
                        logger.silly("Character averageItemLevel already exist, do nothing");
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
                    averageItemLevel: bnetCharacter.items.averageItemLevel
                }, function (error) {
                    logger.verbose("Insert averageItemLevel %s for %s/%s/%s", bnetCharacter.items.averageItemLevel, bnetCharacter.region, bnetCharacter.realm, bnetCharacter.name);
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
        logger.warning("averageItemLevel missing in bnet json");
        callback();
    }
};