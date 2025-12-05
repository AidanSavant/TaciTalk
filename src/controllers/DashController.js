const db = require("./DatabaseManager");
const redis = require("./RedisManager");

async function getUserConversations(req, res) {
  try {
    const id = req.params.id;
  
    const conversation = await db.getUserConversations(id);

    if (!conversation || conversation.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.status(200).json(conversation);
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
    
    if (!Array.isArray(userIds)) userIds = [];
    console.log(userIds)

    if (type === "SINGLE" || (type === "GROUP" && !title)) {
      const names = await db.getUsernames(userIds);
      if (names.length > 0) {
        title = names.join(", ");
      }
    }

    if (!title) title = "New Conversation";

    const conversationId = await db.createConversation(title, type, createdBy);

    const allMembers = [...userIds, createdBy]; 
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

module.exports = { 
  getUserConversations, 
  getUserFriends, 
  getUsers, 
  createConversation, 
  getMessages 
};
