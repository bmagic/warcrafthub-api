var applicationStorage = require("core/application-storage");

module.exports.load = function (callback) {


    //Load config file
    applicationStorage.env = process.env.NODE_ENV || "dev";
    applicationStorage.config = require("config/config." + applicationStorage.env + ".js");

    callback();
};