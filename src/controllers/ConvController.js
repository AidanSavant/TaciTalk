const dataBase = require("../controllers/DatabaseManager");

async function getUserConversations(req, res) {
  try {
    const id = req.params.id;
    console.log(id);
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

module.exports = { getUserConversations };
