const router = require("express").Router();
const ConvController = require("../controllers/ConvController");

router.get("/conversations/:id", ConvController.getUserConversations);

module.exports = router;
