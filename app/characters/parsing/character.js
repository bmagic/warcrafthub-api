var applicationStorage = require("core/application-storage");
var async = require("async");

module.exports.parse = function (bnetCharacter, callback) {

    var logger = applicationStorage.logger;

    //Check if bnet value is ok
    if (bnetCharacter.class != undefined && bnetCharacter.race != undefined && bnetCharacter.gender != undefined && bnetCharacter.faction != undefined) {
        var collection = applicationStorage.mongo.collection("characters");
        async.series([
            function (callback) {
                collection.findOne({
                        region: bnetCharacter.region,
                        realm: bnetCharacter.realm,
                        name: bnetCharacter.name,
                        class: bnetCharacter.class,
                        race: bnetCharacter.race,
                        gender: bnetCharacter.gender,
                        faction: bnetCharacter.faction
                    },
                    {_id: 1}, {sort: [["_id", "desc"]]},
                    function (error, character) {
                        if (character) {
                            logger.silly("Character already exist, do nothing.");
                            callback(true);
                        } else {
                            callback();
                        }
                    }
                );
            },
            function (callback) {
                collection.insertOne({
                        region: bnetCharacter.region,
                        realm: bnetCharacter.realm,
                        name: bnetCharacter.name,
                        class: bnetCharacter.class,
                        race: bnetCharacter.race,
                        gender: bnetCharacter.gender,
                        faction: bnetCharacter.faction
                    },
                    function (error) {
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
    } else {
        logger.warn("Class, race, gender or faction missing in bnet json");
        callback();
    }
};