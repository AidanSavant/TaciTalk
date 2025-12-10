import db from "./DatabaseManager.js";
// const redis = require("./RedisManager");

async function getUserConversations(req, res) {
  try {
    const id = req.params.id;
  
    const conversation = await db.getUserConversations(id);

    if (!conversation || conversation.length === 0) {
      return res.status(200).json(conversation || []);
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
}

async function updateBio(req, res) {
  try {
    const id = req.params.id;
    const bio = req.body.bio;

    await db.updateUserBio(id, bio);

    res.status(200).json({ message: "Bio updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
}

async function getUserById(req, res) {
  try {
    const id = req.params.id;
    const user = await db.getUsername(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
}

async function getUsers(req, res) {
  try {
    const users = await db.getUsers();
    
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
}


async function getUserFriends(req, res) { 
  try {
    const id = req.params.id;
    const friends = await db.getUserFriendships(id);

    res.status(200).json(friends);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
}

async function createConversation(req, res) {
  try {
    let { title, type, userIds, createdBy } = req.body;
    
    title = title?.trim() || "";
   
  
    if (!title || title === "New Chat") {
      const names = await db.getUsernames(userIds);

      if (type === "SINGLE") {
        title = names[0];
      } else if (type === "GROUP") {
        title = names.join(", ");
      }
    }

    const conversationId = await db.createConversation(title, type, createdBy);

    const allMembers = [...new Set([...userIds, createdBy])];
    await db.addConversationMembers(conversationId, allMembers);

    res.status(201).json({
      message: "Success",
      conversationId,
      title,
      membersAdded: allMembers.length
    });
  } catch (error) {
    console.error("Create Chat Error:", error);
    res.status(500).json({ message: "Server Error", error: error.toString() });
  }
}

async function getConversationUsers(req, res) {
  try {
    const conversationID = req.params.id;
    const members = await db.getConversationMembers(conversationID);
    res.status(200).json(members);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
}



async function getMessages(req, res) {
  const conversationId = req.params.id;

  /*
  try {
    const savedMessages = await db.getConversationMessages(conversationId);
    const unsavedMessages = await redis.getMessagesInConversation(conversationId);

    const allMessages = [...savedMessages, ...unsavedMessages];
    allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.status(200).json(allMessages);
  }
  catch(error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
  */
}

export default {
  getUserConversations,
  getUserFriends,
  getUsers,
  createConversation,
  getMessages,
  updateBio,
  getConversationUsers,
  getUserById,
};
