"use strict";

//Load dependencies
var router = require("express").Router();
var passport = require("passport");
var userController = require("users/user-controller");
var auth = require("users/middleware/auth.js");


//Load express passport bnetAuth middleware
require("users/middleware/bnet-auth.js");

//Define routes
router.get("/auth/bnet", passport.authenticate("bnet"));
router.get("/auth/bnet/callback", passport.authenticate("bnet", {successRedirect: 'http://localhost:3000', failureRedirect: 'http://localhost:3000'}));
router.get('/logout', auth.isAuthenticated, userController.logout);
router.get("/profile", userController.getProfile);
// router.get("/user/characterAds", auth.isAuthenticated, userController.getCharacterAds);
// router.get("/user/guildAds", auth.isAuthenticated, userController.getGuildAds);
// router.get("/user/characters/:region", auth.isAuthenticated, userController.getCharacters);
// router.get("/user/guilds/:region", auth.isAuthenticated, userController.getGuilds);
// router.get("/user/guildRank/:region/:realm/:name", auth.isAuthenticated, userController.getGuildRank);
// router.put("/user/profile",auth.isAuthenticated, userController.putProfile)
// router.get("/user/unreadMessageCount", auth.isAuthenticated, userController.getUnreadMessageCount);

module.exports = router;

