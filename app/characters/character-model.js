var applicationStorage = require("core/application-storage.js");

module.exports.insertOne = function (region, realm, name, callback) {
    var collection = applicationStorage.mongo.collection("characters");
    collection.insertOne({region: region, realm: realm, name: name}, function (error) {
        callback(error);
    });
};

module.exports.findOne = function (region, realm, name, callback) {
    var collection = applicationStorage.mongo.collection("characters");
    collection.findOne({region: region, realm: realm, name: name}, {_id: 1}, function (error, faction) {
        callback(error, faction);
    });
};