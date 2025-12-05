const router = require("express").Router();
const DashController = require("../controllers/DashController");

router.get("/users", DashController.getUsers);
router.get("/friends/:id", DashController.getUserFriends);
router.get("/conversations/:id", DashController.getUserConversations);
router.get("/conversations/:id/messages", DashController.getMessages);

router.post("/newConversation", DashController.createConversation);

module.exports = router;
