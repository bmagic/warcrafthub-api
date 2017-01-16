var applicationStorage = require("core/application-storage");

module.exports.start = function () {
    var logger = applicationStorage.logger;
    logger.info('Starting to parse character');

    //Get next character to update
    //Load BNET Data & Freeze it
    //Call "submodules" with bnet Data (they do the stuff)

    setTimeout(this,1000);
};