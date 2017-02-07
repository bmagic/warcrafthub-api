var applicationStorage = require("core/application-storage");
var async = require("async");

module.exports.parse = function (bnetCharacter, callback) {

    var logger = applicationStorage.logger;
    if (bnetCharacter.thumbnail !== undefined) {
        var collection = applicationStorage.mongo.collection("character_thumbnails");

        collection.updateOne({
            region: bnetCharacter.region,
            realm: bnetCharacter.realm,
            name: bnetCharacter.name,
        }, {$set: {thumbnail:bnetCharacter.thumbnail}}, {upsert: true}, function (error) {
            logger.verbose("Insert thumbnail for %s/%s/%s", bnetCharacter.region, bnetCharacter.realm, bnetCharacter.name);
            callback(error);
        });
    }
    else {
        logger.warn("Thumbnail missing in bnet json");
        callback();
    }
};