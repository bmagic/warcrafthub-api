var async = require("async");
var updateModel = require("updates/update-model");
var applicationStorage = require("core/application-storage");

module.exports.parse = function (bnetGuild, callback) {
    var logger = applicationStorage.logger;
    async.each(bnetGuild.members, function (member, callback) {
        if (member.character && member.character.realm && member.character.name) {
            updateModel.insert("cu", bnetGuild.region, member.character.realm, member.character.name, 0, function (error) {
                logger.verbose("Insert character %s/%s/%s to update ", bnetGuild.region, member.character.realm, member.character.name);
                callback(error);
            })
        } else {
            logger.warning("Members error in bnet json")
            callback();
        }
    }, function (error) {
        callback(error);
    });

};