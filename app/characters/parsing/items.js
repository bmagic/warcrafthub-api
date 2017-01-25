var applicationStorage = require("core/application-storage");
var async = require("async");

module.exports.parse = function (bnetCharacter, callback) {

    var logger = applicationStorage.logger;
    if (bnetCharacter.items !== undefined) {
        var collection = applicationStorage.mongo.collection("character_items");

        var itemsSlots = ["head", "neck", "shoulder", "back", "chest", "shirt", "tabard", "wrist", "hands", "waist", "legs", "feet", "finger1", "finger2", "trinket1", "trinket2", "mainHand", "offHand"];

        var items = {};
        itemsSlots.forEach(function (slot) {
            if (bnetCharacter.items[slot] !== undefined) {
                items[slot] = {
                    id: bnetCharacter.items[slot].id,
                    name: bnetCharacter.items[slot].name,
                    icon: bnetCharacter.items[slot].icon,
                    quality: bnetCharacter.items[slot].quality,
                    bonusLists: bnetCharacter.items[slot].bonusLists
                };
            }

        });

        collection.updateOne({
            region: bnetCharacter.region,
            realm: bnetCharacter.realm,
            name: bnetCharacter.name,
        }, {$set: {items:items}}, {upsert: true}, function (error) {
            logger.info("Insert items for %s/%s/%s", bnetCharacter.region, bnetCharacter.realm, bnetCharacter.name);
            callback(error);
        });
    }
    else {
        logger.warning("Items missing in bnet json");
        callback();
    }
};