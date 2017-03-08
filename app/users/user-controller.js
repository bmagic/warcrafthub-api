var applicationStorage = require("core/application-storage.js");

/**
 * Logout function for express
 * @param req
 * @param res
 */
module.exports.logout = function (req, res) {
    req.logout();
    res.redirect('/');
};


/**
 * Get the user profile
 * @param req
 * @param res
 */
module.exports.getProfile = function (req, res) {
    if(req.user) {
        res.json(req.user);
    }
    else {
        res.json({})
    }
};
