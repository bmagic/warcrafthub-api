var applicationStorage = require("core/application-storage");

module.exports.load = function (callback) {


    //Load config file
    applicationStorage.env = process.env.NODE_ENV || "dev";
    if (applicationStorage.env == "dev")
        applicationStorage.config = require("config/config." + applicationStorage.env + ".js");
    else
        applicationStorage.config = require("config/config.js");

    callback();
};