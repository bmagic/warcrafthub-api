module.exports.parse = function (bnetCharacter, character) {
    character.class = bnetCharacter.class;
    character.race = bnetCharacter.race;
    character.gender = bnetCharacter.gender;
    character.faction = bnetCharacter.faction;
    character.thumbnail = bnetCharacter.thumbnail;
    character.level = bnetCharacter.level;
};