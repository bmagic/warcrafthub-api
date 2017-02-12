var applicationStorage = require("core/application-storage");

module.exports.parse = function (bnetCharacter, callback) {

    var logger = applicationStorage.logger;

    var collection = applicationStorage.mongo.collection("character_items");


    collection.updateOne({
            region: bnetCharacter.region,
            realm: bnetCharacter.realm,
            name: bnetCharacter.name
        }, {
            $set: {
                items: getItems(bnetCharacter.items),
                averageItemLevel: bnetCharacter.items.averageItemLevel,
                averageItemLevelEquipped: bnetCharacter.items.averageItemLevelEquipped
            }
        }, {upsert: true},
        function (error) {
            logger.verbose("Insert character items %s/%s/%s", bnetCharacter.region, bnetCharacter.realm, bnetCharacter.name)
            callback(error);
        })


};


function getItems(bnetItems) {

    var itemsSlots = ["head", "neck", "shoulder", "back", "chest", "shirt", "tabard", "wrist", "hands", "waist", "legs", "feet", "finger1", "finger2", "trinket1", "trinket2", "mainHand", "offHand"];

    var items = {};
    itemsSlots.forEach(function (slot) {
        if (bnetItems[slot] !== undefined) {
            items[slot] = {
                id: bnetItems[slot].id,
                name: bnetItems[slot].name,
                icon: bnetItems[slot].icon,
                quality: bnetItems[slot].quality,
                bonusLists: bnetItems[slot].bonusLists,
                itemLevel: bnetItems[slot].itemLevel
            };

            if (bnetItems[slot].tooltipParams) {
                if (bnetItems[slot].tooltipParams.enchant) {
                    items[slot].enchant = bnetItems[slot].tooltipParams.enchant
                }
                if (bnetItems[slot].tooltipParams.gem0) {
                    items[slot].gems = [bnetItems[slot].tooltipParams.gem0]
                }
                if (bnetItems[slot].tooltipParams.gem1) {
                    items[slot].gems.push(bnetItems[slot].tooltipParams.gem1)
                }
                if (bnetItems[slot].tooltipParams.gem2) {
                    items[slot].gems.push(bnetItems[slot].tooltipParams.gem2)
                }
            }
        }
    });

    return items;


}