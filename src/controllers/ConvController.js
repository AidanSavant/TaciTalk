const dataBase = require("../controllers/DatabaseManager");

async function getConversationById(req, res) {
  try {
    const id = req.params.id;

    const conversation = await dataBase.getConversationById(id);

    if (!conversation || conversation.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
}

module.exports = { getConversationById };
