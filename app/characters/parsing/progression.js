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

                var lfrKills = 0;
                var normalKills = 0;
                var heroicKills = 0;
                var mythicKills = 0;

                raid.bosses.forEach(function (boss) {
                    if (boss.mythicKills > 0)
                        mythicKills++;
                    if (boss.heroicKills > 0)
                        heroicKills++;
                    if (boss.normalKills > 0)
                        normalKills++;
                    if (boss.lfrKills > 0)
                        lfrKills++;
                });

                progression[raid.name] = {
                    lfrKills: lfrKills,
                    normalKills: normalKills,
                    heroicKills: heroicKills,
                    mythicKills: mythicKills,
                    bosses: raid.bosses
                }
            }
        });
    }

    return progression;


}