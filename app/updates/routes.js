"use strict";

//Load dependencies
var router = require("express").Router();
var updateController = require("updates/update-controller.js");

//Define routes
router.post('/', updateController.postUpdate);


module.exports = router;