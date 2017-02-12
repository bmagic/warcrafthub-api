var applicationStorage = require("core/application-storage");
var async = require("async");

module.exports.parse = function (bnetCharacter, callback) {

    var logger = applicationStorage.logger;

    var collection = applicationStorage.mongo.collection("characters");

    collection.updateOne({
            region: bnetCharacter.region,
            realm: bnetCharacter.realm,
            name: bnetCharacter.name
        }, {
            $set: {
                class: bnetCharacter.class,
                race: bnetCharacter.race,
                gender: bnetCharacter.gender,
                faction: bnetCharacter.faction,
                thumbnail: bnetCharacter.thumbnail,
            }
        }, {upsert: true},
        function (error) {
            logger.verbose("Insert character %s/%s/%s", bnetCharacter.region, bnetCharacter.realm, bnetCharacter.name)
            callback(error);
        })
};