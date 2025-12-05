const dataBase = require("./DatabaseManager");

async function getUserConversations(req, res) {
  try {
    const id = req.params.id;
  
    const conversation = await dataBase.getUserConversations(id);

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
    const users = await dataBase.getUsers();

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
}


async function getUserFriends(req, res) { 
  try {
    const id = req.params.id;
    const friends = await dataBase.getUserFriendships(id);

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
    
    const DEFAULT_TITLE = "New Chat";  

    // Always recalc title for SINGLE
    if (type === "SINGLE") {
      const names = await dataBase.getUsernames(userIds);
      if (names.length > 0) {
        title = names[0]; // SINGLE = exactly one name
      }
    }

  
    if (type === "GROUP") {
      const userProvidedCustomTitle = title && title !== DEFAULT_TITLE;

      if (!userProvidedCustomTitle) {
        const names = await dataBase.getUsernames(userIds);
        if (names.length > 0) {
          title = names.join(", ");  // Group = join names
        } else {
          title = DEFAULT_TITLE;
        }
      }
    }

  
    if (!title) title = DEFAULT_TITLE;

    const conversationId = await dataBase.createConversation(title, type, createdBy);

    const allMembers = [...userIds, createdBy];
    await dataBase.addConversationMembers(conversationId, allMembers);

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

module.exports = { getUserConversations, getUserFriends, getUsers, createConversation };
