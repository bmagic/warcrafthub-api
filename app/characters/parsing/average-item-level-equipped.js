var applicationStorage = require("core/application-storage");
var async = require("async");

module.exports.parse = function (bnetCharacter, callback) {

    var logger = applicationStorage.logger;

    if (bnetCharacter.items !== undefined && bnetCharacter.items.averageItemLevelEquipped !== undefined) {
        var collection = applicationStorage.mongo.collection("character_average_item_levels_equipped");
        async.series([
            function (callback) {
                collection.findOne({
                    region: bnetCharacter.region,
                    realm: bnetCharacter.realm,
                    name: bnetCharacter.name,
                    averageItemLevelEquipped: bnetCharacter.items.averageItemLevelEquipped
                }, {_id: 1}, {sort: [["_id", "desc"]]}, function (error, character) {
                    if (character) {
                        logger.silly("Character averageItemLevelEquipped already exist, do nothing");
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
                    averageItemLevelEquipped: bnetCharacter.items.averageItemLevelEquipped
                }, function (error) {
                    logger.verbose("Insert averageItemLevelEquipped %s for %s/%s/%s", bnetCharacter.items.averageItemLevelEquipped, bnetCharacter.region, bnetCharacter.realm, bnetCharacter.name);
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
        logger.warn("averageItemLevelEquipped missing in bnet json");
        callback();
    }
};