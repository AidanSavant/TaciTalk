const router = require("express").Router();
const DashController = require("../controllers/DashController");

router.get("/conversations/:id", DashController.getUserConversations);
router.get("/friends/:id", DashController.getUserFriends);
router.get("/users", DashController.getUsers);


module.exports = router;
