var async = require("async");
var bnetAPI = require("core/api/bnet");
var applicationStorage = require("core/application-storage");
var updateUtils = require("updates/update-utils");
var updateModel = require("updates/update-model");

module.exports.start = function () {
    var logger = applicationStorage.logger;
    var self = this;
    async.series(
        [
            function (callback) {
                //Look if characterUpdates, guildUpdates & auctionUpdates are empty
                async.parallel({
                    characterUpdatesCount: function (callback) {
                        updateModel.getCount("c", 0, function (error, count) {
                            callback(error, count);
                        });
                    },
                    guildUpdatesCount: function (callback) {
                        updateModel.getCount("g", 0, function (error, count) {
                            callback(error, count);
                        });
                    },
                    auctionUpdatesCount: function (callback) {
                        updateModel.getCount("a", 0, function (error, count) {
                            callback(error, count);
                        });
                    }
                }, function (error, results) {
                    if (error) {
                        callback(error);
                    } else if (results.characterUpdatesCount === 0 && results.guildUpdatesCount === 0 && results.auctionUpdatesCount === 0) {
                        callback();
                    } else {
                        logger.info("Cannot Feed Auctions characterUpdate, guildUpdate & auctionUpdate are not empty. Waiting 1 min");
                        setTimeout(function () {
                            callback(true);
                        }, 60000);
                    }
                });
            },
            function (callback) {
                importAuctionOwners(function (error) {
                    callback(error);
                });
            }
        ], function (error) {
            if (error && error != true) {
                logger.error(error.message);
            }
            self.start();
        }
    );
};

function importAuctionOwners(callback) {
    var logger = applicationStorage.logger;
    async.waterfall([
        function (callback) {
            updateUtils.getNextUpdate('ra', function (error, realmAuctionsUpdate) {
                if (error) {
                    callback(error);
                } else if (realmAuctionsUpdate) {
                    logger.info("Update with realm auctions %s/%s", realmAuctionsUpdate.region, realmAuctionsUpdate.name);
                    callback(error, realmAuctionsUpdate);
                } else {
                    //Guild update is empty
                    logger.info("No realm auctions to update, import them.");
                    importAuctionRealms(function () {
                        callback(true);
                    });
                }
            });
        },
        function (auctionRealmUpdate, callback) {
            if (auctionRealmUpdate) {
                bnetAPI.getAuctions(auctionRealmUpdate.region, auctionRealmUpdate.name, function (error, auctions) {
                    auctions.region = auctionRealmUpdate.region;
                    callback(error, auctions);
                });
            } else {
                logger.info("No AuctionRealmUpdate found, import them.");
                importAuctionRealms(function () {
                    callback(true);
                });
            }
        },
        function (auctions, callback) {
            async.each(auctions, function (auction, callback) {
                updateModel.insert("a", auctions.region, auction.ownerRealm, auction.owner, 0, function (error) {
                    logger.info("Insert auction owner %s/%s/%s to update ", auctions.region, auction.ownerRealm, auction.owner);
                    callback(error);
                });
            }, function (error) {
                callback(error);
            });
        }
    ], function (error) {
        callback(error);
    });
}

function importAuctionRealms(callback) {
    var logger = applicationStorage.logger;
    var config = applicationStorage.config;
    async.each(config.regions, function (region, callback) {

        async.waterfall([
            function (callback) {
                bnetAPI.getRealms(region, function (error, realms) {
                    callback(error, realms);
                });
            },
            function (realms, callback) {
                async.eachSeries(realms, function (realm, callback) {
                    updateModel.insert("ra", region, "", realm.connected_realms[0], 0, function (error) {
                        logger.verbose("Insert realm auctions %s/%s to update", region, realm.connected_realms[0]);
                        callback(error);
                    });
                }, function (error) {
                    callback(error);
                });
            }
        ], function (error) {
            callback(error);
        });
    }, function (error) {
        callback(error);
    });
}
