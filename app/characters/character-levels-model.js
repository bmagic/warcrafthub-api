var applicationStorage = require("core/application-storage.js");

module.exports.insertOne = function (region, realm, name, level, callback) {
    var collection = applicationStorage.mongo.collection("character_levels");
    collection.insertOne({region: region, realm: realm, name: name, level: level}, function (error) {
        callback(error);
    });
};

module.exports.findOne = function (region, realm, name, callback) {
    var collection = applicationStorage.mongo.collection("character_levels");
    collection.findOne({region: region, realm: realm, name: name}, {_id: 0, level: 1}, function (error, faction) {
        callback(error, faction);
    });
};