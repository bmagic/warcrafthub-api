module.exports.parse = function (bnetCharacter, character) {
    character.progression = getProgression(bnetCharacter.progression);
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