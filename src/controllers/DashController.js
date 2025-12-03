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

module.exports = { getUserConversations, getUserFriends, getUsers };
