var winston = require("winston");
var applicationStorage = require("core/application-storage");

module.exports.start = function (callback) {
    var transports = [
        new (require("winston-daily-rotate-file"))({
            filename: applicationStorage.config.logger.folder + "/" + applicationStorage.env + ".log",
            json: false,
            handleExceptions: true
        })];
    if (applicationStorage.env === "dev") {
        transports.push(new (winston.transports.Console)({handleExceptions: true}));
    }

    applicationStorage.logger = new (winston.Logger)({
        level: applicationStorage.config.logger.level,
        transports: transports
    });
    applicationStorage.logger.info("Logger initialized");
    callback();
};