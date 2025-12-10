import express from "express";
import DashController from "../controllers/DashController.js";

const router = express.Router();

router.get("/users", DashController.getUsers);
router.get("/friends/:id", DashController.getUserFriends);
router.get("/conversations/:id", DashController.getUserConversations);
router.get("/conversations/:id/messages", DashController.getMessages);
router.post("/newConversation", DashController.createConversation);
router.put("/updateBio/:id", DashController.updateBio);
router.get("/conversations/:id/users", DashController.getConversationUsers);
router.get("/users/:id", DashController.getUserById);


export default router;
