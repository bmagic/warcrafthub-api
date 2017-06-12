var applicationStorage = require("core/application-storage");
var warcraftLogsAPI = require("core/api/warcraftLogs");
var async = require("async");

module.exports.parse = function (bnetCharacter, callback) {

    var logger = applicationStorage.logger;
    async.waterfall([
        function (callback) {
            getRealmSlug(bnetCharacter.region, bnetCharacter.realm, function (error, realmSlug) {
                callback(error, realmSlug);
            });
        },
        function (realmSlug, callback) {
            getWarcraftLogs(bnetCharacter.region, realmSlug, bnetCharacter.name, function (error, wLogsResults) {
                callback(error, wLogsResults);
            });
        },
        function (wLogsResults, callback) {
            if (wLogsResults.hps && wLogsResults.dps)
                callback(null, formatWarcraftLogs(wLogsResults.hps, wLogsResults.dps, bnetCharacter.class));
            else
                callback(true);
        }
    ], function (error, wLogsResults) {
        if (error === true)
            callback();
        else
            callback(error, wLogsResults);
    });
};


function getWarcraftLogs(region, realm, name, callback) {
    var logger = applicationStorage.logger;

    async.parallel({
        dps: function (callback) {
            warcraftLogsAPI.getRankings(region, realm, name, 'dps', '11', function (error, warcraftLogs) {
                if (error) {
                    logger.verbose(error.message);
                    callback()
                } else {
                    callback(null, warcraftLogs);
                }
            });
        },
        hps: function (callback) {
            warcraftLogsAPI.getRankings(region, realm, name, 'hps', '11', function (error, warcraftLogs) {
                if (error) {
                    logger.verbose(error.message);
                    callback()
                } else {
                    callback(null, warcraftLogs);
                }
            });
        }
    }, function (error, wLogsResults) {
        callback(error, wLogsResults);
    });

}

function formatWarcraftLogs(wclDps, wclHps, characterClass) {
    var self = this;

    var classSpecStr = {
        1: {"Arms": 0, "Fury": 1, "Protection": 2},
        2: {"Holy": 0, "Protection": 1, "Retribution": 2},
        3: {"BeastMastery": 0, "Marksmanship": 1, "Survival": 2},
        4: {"Assassination": 0, "Outlaw": 1, "Combat": 1, "Subtlety": 2},
        5: {"Discipline": 0, "Holy": 1, "Shadow": 2},
        6: {"Blood": 0, "Frost": 1, "Unholy": 2},
        7: {"Elemental": 0, "Enhancement": 1, "Restoration": 2},
        8: {"Arcane": 0, "Fire": 1, "Frost": 2},
        9: {"Affliction": 0, "Demonology": 1, "Destruction": 2},
        10: {"Brewmaster": 0, "Mistweaver": 1, "Windwalker": 2},
        11: {"Balance": 0, "Feral": 1, "Guardian": 2, "Restoration": 3},
        12: {"Havoc": 0, "Vengeance": 1}
    };

    var classSpec = {
        1: {0: "dps", 1: "dps", 2: "dps", 3: null},
        2: {0: "heal", 1: "tank", 2: "dps", 3: null},
        3: {0: "dps", 1: "dps", 2: "dps", 3: null},
        4: {0: "dps", 1: "dps", 2: "dps", 3: null},
        5: {0: "heal", 1: "heal", 2: "dps", 3: null},
        6: {0: "tank", 1: "dps", 2: "dps", 3: null},
        7: {0: "dps", 1: "dps", 2: "heal", 3: null},
        8: {0: "dps", 1: "dps", 2: "dps", 3: null},
        9: {0: "dps", 1: "dps", 2: "dps", 3: null},
        10: {0: "tank", 1: "heal", 2: "dps", 3: null},
        11: {0: "dps", 1: "dps", 2: "tank", 3: "heal"},
        12: {0: "dps", 1: "tank", 2: null, 3: null}
    };

    if (wclDps || wclHps) {
        var warcraftLogs = {bosses: {}, difficulty: {3: {}, 4: {}, 5: {}}, 'bestHighSpec': {}, 'bestAllSpec': {}};

        // DPS
        if (wclDps.logs && wclDps.logs instanceof Array) {
            wclDps.logs.forEach(function (log) {
                if (log.name && !warcraftLogs.bosses[log.name]) {
                    warcraftLogs.bosses[log.name] = {
                        difficulty: {
                            3: {0: null, '1': null, '2': null, '3': null},
                            4: {0: null, '1': null, '2': null, '3': null},
                            5: {0: null, '1': null, '2': null, '3': null}
                        }
                    };
                }

                if (log.difficulty >= 3 && log.difficulty <= 5) {
                    log.specs.forEach(function (spec) {
                        if (!spec.combined) {
                            var specNumber = classSpecStr[characterClass][spec.spec];

                            if (spec.spec && !warcraftLogs.difficulty[log.difficulty][specNumber]) {
                                warcraftLogs.difficulty[log.difficulty][specNumber] = {
                                    kill: 0,
                                    average: 0,
                                    median: 0,
                                    best: 0,
                                    number: 0
                                };
                            }

                            if (log.name && log.difficulty && characterClass && spec.spec) {
                                if (classSpec[characterClass][specNumber] === "dps" || classSpec[characterClass][specNumber] === "tank") {
                                    warcraftLogs.bosses[log.name].difficulty[log.difficulty][specNumber] = {
                                        kill: spec.historical_total,
                                        average: Math.round(spec.historical_avg),
                                        median: Math.round(spec.historical_median),
                                        best: Math.round(spec.best_historical_percent)
                                    };
                                    warcraftLogs.difficulty[log.difficulty][specNumber].kill += spec.historical_total;
                                    warcraftLogs.difficulty[log.difficulty][specNumber].average += Math.round(spec.historical_avg);
                                    warcraftLogs.difficulty[log.difficulty][specNumber].median += Math.round(spec.historical_median);
                                    warcraftLogs.difficulty[log.difficulty][specNumber].best += Math.round(spec.best_historical_percent);
                                    warcraftLogs.difficulty[log.difficulty][specNumber].number += 1;
                                }
                            }
                        }
                    });
                }
            });
        }

        // Healer
        if (wclHps.logs && wclHps.logs instanceof Array) {
            wclHps.logs.forEach(function (log) {
                if (log.name && !warcraftLogs.bosses[log.name]) {
                    warcraftLogs.bosses[log.name] = {
                        difficulty: {
                            3: {0: null, '1': null, '2': null, '3': null},
                            4: {0: null, '1': null, '2': null, '3': null},
                            5: {0: null, '1': null, '2': null, '3': null}
                        }
                    };
                }

                if (log.difficulty >= 3 && log.difficulty <= 5) {
                    log.specs.forEach(function (spec) {
                        if (!spec.combined) {
                            var specNumber = classSpecStr[characterClass][spec.spec];

                            if (spec.spec && !warcraftLogs.difficulty[log.difficulty][specNumber]) {
                                warcraftLogs.difficulty[log.difficulty][specNumber] = {
                                    kill: 0,
                                    average: 0,
                                    median: 0,
                                    best: 0,
                                    number: 0
                                };
                            }

                            if (log.name && log.difficulty && characterClass && spec.spec) {
                                if (classSpec[characterClass][specNumber] === "heal") {
                                    warcraftLogs.bosses[log.name].difficulty[log.difficulty][specNumber] = {
                                        kill: spec.historical_total,
                                        average: Math.round(spec.historical_avg),
                                        median: Math.round(spec.historical_median),
                                        best: Math.round(spec.best_historical_percent)
                                    };
                                    warcraftLogs.difficulty[log.difficulty][specNumber].kill += spec.historical_total;
                                    warcraftLogs.difficulty[log.difficulty][specNumber].average += Math.round(spec.historical_avg);
                                    warcraftLogs.difficulty[log.difficulty][specNumber].median += Math.round(spec.historical_median);
                                    warcraftLogs.difficulty[log.difficulty][specNumber].best += Math.round(spec.best_historical_percent);
                                    warcraftLogs.difficulty[log.difficulty][specNumber].number += 1;
                                }
                            }
                        }
                    });
                }
            });
        }

        // Calc ratio for each difficulty & spec
        var i = 0;
        var bestHighSpecTotal = {kill: 0, average: 0, median: 0, best: 0, number: 0};
        var bestAllSpecTotal = {kill: 0, average: 0, median: 0, best: 0, number: 0};

        // Calc best spec in highest difficulty & best spec overall
        Object.keys(warcraftLogs.bosses).forEach(function (key, value) {
            var averageSpec = {
                0: {kill: 0, average: 0, median: 0, best: 0, number: 0},
                1: {kill: 0, average: 0, median: 0, best: 0, number: 0},
                2: {kill: 0, average: 0, median: 0, best: 0, number: 0},
                3: {kill: 0, average: 0, median: 0, best: 0, number: 0}
            };
            var bestHighSpec = {kill: 0, average: 0, median: 0, best: 0, difficulty: 0};
            for (var difficulty = 3; difficulty <= 5; difficulty++) {
                for (var spec = 0; spec <= 3; spec++) {
                    if (warcraftLogs.bosses[key].difficulty[difficulty] && warcraftLogs.bosses[key].difficulty[difficulty][spec]) {
                        averageSpec[spec].kill += warcraftLogs.bosses[key].difficulty[difficulty][spec].kill;
                        averageSpec[spec].average += warcraftLogs.bosses[key].difficulty[difficulty][spec].average;
                        averageSpec[spec].median += warcraftLogs.bosses[key].difficulty[difficulty][spec].median;
                        averageSpec[spec].best += warcraftLogs.bosses[key].difficulty[difficulty][spec].best;
                        averageSpec[spec].number += 1;

                        if (warcraftLogs.bosses[key].difficulty[difficulty][spec].kill > bestHighSpec.kill || difficulty > bestHighSpec.difficulty) {
                            bestHighSpec = warcraftLogs.bosses[key].difficulty[difficulty][spec];
                            bestHighSpec.difficulty = difficulty;
                        }
                    }
                }
            }

            var bestAllSpec = {kill: 0, average: 0, median: 0, number: 0};
            for (var spec = 0; spec <= 3; spec++) {
                if (averageSpec[spec].kill > bestAllSpec.kill) {
                    if (averageSpec[spec].number > 0) {
                        averageSpec[spec].average = Math.round(averageSpec[spec].average / averageSpec[spec].number);
                        averageSpec[spec].median = Math.round(averageSpec[spec].median / averageSpec[spec].number);
                        averageSpec[spec].best = Math.round(averageSpec[spec].best / averageSpec[spec].number);
                    }
                    bestAllSpec = averageSpec[spec];
                }
            }

            warcraftLogs.bosses[key]['bestAllSpec'] = bestAllSpec;
            warcraftLogs.bosses[key]['bestHighSpec'] = bestHighSpec;

            // Add to total
            bestHighSpecTotal.kill += bestHighSpec.kill;
            bestHighSpecTotal.average += bestHighSpec.average;
            bestHighSpecTotal.median += bestHighSpec.median;
            bestHighSpecTotal.best += bestHighSpec.best;
            bestHighSpecTotal.number += 1;

            bestAllSpecTotal.kill += bestAllSpec.kill;
            bestAllSpecTotal.average += bestAllSpec.average;
            bestAllSpecTotal.median += bestAllSpec.median;
            bestAllSpecTotal.best += bestAllSpec.best;
            bestAllSpecTotal.number += 1;
        });

        parseWarcraftLogsAverage(bestAllSpecTotal);
        parseWarcraftLogsAverage(bestHighSpecTotal);

        for (var difficulty = 3; difficulty <= 5; difficulty++) {
            for (var spec = 0; spec <= 3; spec++) {
                if (warcraftLogs.difficulty[difficulty] && warcraftLogs.difficulty[difficulty][spec]) {
                    parseWarcraftLogsAverage(warcraftLogs.difficulty[difficulty][spec]);
                }
            }
        }

        warcraftLogs['bestAllSpec'] = bestAllSpecTotal;
        warcraftLogs['bestHighSpec'] = bestHighSpecTotal;
    } else {
        var warcraftLogs = {
            bosses: {},
            difficulty: {3: {}, 4: {}, 5: {}},
            'bestHighSpec': {kill: 0, average: 0, median: 0, best: 0, number: 0},
            'bestAllSpec': {kill: 0, average: 0, median: 0, best: 0, number: 0}
        };
    }

    return warcraftLogs;
}


function parseWarcraftLogsAverage(data) {
    if (data && data.number && data.number > 0) {
        data.average = Math.round(data.average / data.number);
        data.median = Math.round(data.median / data.number);
        data.best = Math.round(data.best / data.number);
    }
}

function getRealmSlug(region, name, callback) {
    var collection = applicationStorage.mongo.collection("realms");
    collection.findOne({region: region, name: name}, {slug: 1}, function (error, slug) {
        callback(error, slug.slug);
    });
}