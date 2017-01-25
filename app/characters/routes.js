//Load dependencies
var router = require("express").Router();
var characterController = require("characters/character-controller");

//Define routes
router.get('/:region/:realm/:name', characterController.getCharacter);


module.exports = router;