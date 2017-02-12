var applicationStorage = require("core/application-storage");

module.exports.parse = function (bnetCharacter, callback) {

    var logger = applicationStorage.logger;

    var collection = applicationStorage.mongo.collection("character_progressions");


    collection.updateOne({
            region: bnetCharacter.region,
            realm: bnetCharacter.realm,
            name: bnetCharacter.name
        }, {
            $set: {
                progression: getProgression(bnetCharacter.progression),
            }
        }, {upsert: true},
        function (error) {
            logger.verbose("Insert character progression %s/%s/%s", bnetCharacter.region, bnetCharacter.realm, bnetCharacter.name)
            callback(error);
        })


};


function getProgression(bnetProgression) {

    var raids = ["The Emerald Nightmare", "Trial of Valor", "The Nighthold"];

    var progression = {};
    if (bnetProgression.raids) {
        bnetProgression.raids.forEach(function (raid) {
            if (raids.indexOf(raid.name) !== -1) {
                progression[raid.name]={
                    lfr: raid.lfr,
                    normal:raid.normal,
                    heroic:raid.heroic,
                    mythic:raid.mythic,
                    bosses:raid.bosses
                }
            }
        });
    }

    return progression;


}