import express from "express";
import DashController from "../controllers/DashController.js";

const router = express.Router();

router.get("/users", DashController.getUsers);
router.get("/friends/:id", DashController.getUserFriends);
router.get("/conversations/:id", DashController.getUserConversations);
router.get("/conversations/:id/messages", DashController.getMessages);
router.post("/newConversation", DashController.createConversation);

export default router;
