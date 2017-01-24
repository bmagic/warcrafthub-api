var applicationStorage = require("core/application-storage.js");

module.exports.insertOne = function (region, realm, name, faction, callback) {
    var collection = applicationStorage.mongo.collection("character_factions");
    collection.insertOne({region: region, realm: realm, name: name, faction: faction}, function (error) {
        callback(error);
    });
};

module.exports.findOne = function (region, realm, name, callback) {
    var collection = applicationStorage.mongo.collection("character_factions");
    collection.findOne({region: region, realm: realm, name: name}, {_id: 0, faction: 1}, function (error, faction) {
        callback(error, faction);
    });
};