
const mysql = require("mysql2/promise");
const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASS;
const database = process.env.DATABASE;
const port = process.env.DB_PORT;

const dbConfig = {
  host,
  user,
  password,
  database,
  port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;
try {
  pool = mysql.createPool(dbConfig);
  console.log("MySQL connection pool initialized successfully.");
} catch (error) {
  console.error("Failed to initialize MySQL pool:", error);
  process.exit(1);
}

class DatabaseManager {
  constructor() {
    this.pool = pool;
  }

  //Method for executing commands on mysql
  async executeQuery(sql, params = []) {
    try {
      const [results] = await this.pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error("Database Query Error:", error.message);
      throw new Error("Database operation failed: " + error.message);
    }
  }

  //USERS CRUD

  //Create a new User
  async createUser(username, passwordHash, bio) {
    const sql = "INSERT INTO Users (Username, Password, Bio) VALUES (?, ?, ?)";
    const params = [username, passwordHash, bio];
    const results = await this.executeQuery(sql, params);
    // Return the ID of the newly inserted user
    return results.insertId;
  }

  async getUser(identifier) {
    let sql, params;
    if (typeof identifier === "number") {
      sql = "SELECT UserID, Username, Bio FROM Users WHERE UserID = ?";
      params = [identifier];
    } else if (typeof identifier === "string") {
      sql =
        "SELECT UserID, Username, Bio, Password FROM Users WHERE Username = ?";
      params = [identifier];
    } else {
      throw new Error(
        "Invalid identifier for getUser. Must be UserID (number) or Username (string).",
      );
    }
    const results = await this.executeQuery(sql, params);
    return results[0] || null; // Return the user object or null if not found
  }
  
  async getUsers() {
    const sql = "SELECT UserID, Username, Bio FROM Users";
    const results = await this.executeQuery(sql);
    return results;
  }

  //Update User Bio
  async updateUserBio(userID, newBio) {
    const sql = "UPDATE Users SET Bio = ? WHERE UserID = ?";
    const params = [newBio, userID];
    const results = await this.executeQuery(sql, params);
    return results.affectedRows; // Return number of rows affected (should be 1)
  }

  //Delete a User
  async deleteUser(userID) {
    const sql = "DELETE FROM Users WHERE UserID = ?";
    const params = [userID];
    const results = await this.executeQuery(sql, params);
    return results.affectedRows;
  }

  //CONVERSATIONS CRUD

  //Create a new Conversation
  async createConversation(title, type, createdBy) {
    
    const now = new Date();
    const sql =
      "INSERT INTO Conversations (ConvoTitle, ConvoType, CreatedBy, LastUpdatedAt) VALUES (?, ?, ?, NOW())";
    const params = [title, type, createdBy];
    const results = await this.executeQuery(sql, params);
    return results.insertId;
  }

  //Read a Conversation by ID
  async getConversation(conversationID) {
    const sql = "SELECT * FROM Conversations WHERE ConversationID = ?";
    const params = [conversationID];
    const results = await this.executeQuery(sql, params);
    return results[0] || null;
  }

  //Read all Conversations for a User
  async getUserConversations(userID) {
    const sql = "SELECT * FROM Conversations WHERE CreatedBy = ?";
    const params = [userID];
    let results = await this.executeQuery(sql, params);
    if (results.length <= 0) {
      results = [];
    }
    return results;
  }

  //Update Conversation Title and Last Update Time
  async updateConversation(
    conversationID,
    newTitle,
    updateLastMessage = false,
  ) {
    let sql = "UPDATE Conversations SET ConvoTitle = ?, LastUpdatedAt = NOW()";
    const params = [newTitle, conversationID];
    if (updateLastMessage) {
      sql += ", LastMessage = NOW()";
    }
    sql += " WHERE ConversationID = ?";
    const results = await this.executeQuery(sql, params);
    return results.affectedRows;
  }

  // ❌ Delete a Conversation
  async deleteConversation(conversationID) {
    //WE NEED TO DETERMINE IF DELETING A MESSAGE CASCADES AND DELETES IT FOR EVERYONE (I vote to delete it for everyone)
    const sql = "DELETE FROM Conversations WHERE ConversationID = ?";
    const params = [conversationID];
    const results = await this.executeQuery(sql, params);
    return results.affectedRows;
  }

  //MESSAGES CRUD

  //Create a new Message
  async createMessage(conversationID, userID, messageType) {
    const sql =
      "INSERT INTO Messages (timeSent, MessageType, SavedAt, ConversationID, UserID) VALUES (NOW(), ?, NOW(), ?, ?)";
    const params = [messageType, conversationID, userID];
    const results = await this.executeQuery(sql, params);
    return results.insertId;
  }

  // Read Messages for a Conversation
  async getConversationMessages(conversationID, limit = 50, offset = 0) {
    const sql = `SELECT * FROM Messages WHERE ConversationID = ? ORDER BY timeSent DESC LIMIT ? OFFSET ?`;
    const params = [conversationID, limit, offset];
    const results = await this.executeQuery(sql, params);
    return results;
  }

  //Delete a Message
  async deleteMessage(messageID) {
    const sql = "DELETE FROM Messages WHERE MessageID = ?";
    const params = [messageID];
    const results = await this.executeQuery(sql, params);
    return results.affectedRows;
  }

  //FRIENDSHIPS CRUD

  //Create/Update a Friendship status (Pending, Friends, Blocked)
  async setFriendshipStatus(user1ID, user2ID, status) {
    const [id1, id2] =
      user1ID < user2ID ? [user1ID, user2ID] : [user2ID, user1ID];

    const sql = `
      INSERT INTO FriendShips (User1ID, User2ID, CurrentStatus)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE CurrentStatus = ?
    `;
    const params = [id1, id2, status, status];
    const results = await this.executeQuery(sql, params);
    return results.affectedRows;
  }

  //Read a specific Friendship status
  async getFriendshipStatus(user1ID, user2ID) {
    const [id1, id2] =
      user1ID < user2ID ? [user1ID, user2ID] : [user2ID, user1ID];
    const sql =
      "SELECT CurrentStatus FROM FriendShips WHERE User1ID = ? AND User2ID = ?";
    const params = [id1, id2];
    const results = await this.executeQuery(sql, params);
    return results[0] ? results[0].CurrentStatus : "None";
  }

  //Read all Friendships/Requests for a User
  async getUserFriendships(userID) {
    const sql = `
      SELECT
        CASE WHEN User1ID = ? THEN User2ID ELSE User1ID END AS FriendID,
        CurrentStatus
      FROM FriendShips
      WHERE User1ID = ? OR User2ID = ?
    `;
    const params = [userID, userID, userID];
    return await this.executeQuery(sql, params);
  }

  // Delete a Friendship (Unfriend or Remove Block)
  async deleteFriendship(user1ID, user2ID) {
    const [id1, id2] =
      user1ID < user2ID ? [user1ID, user2ID] : [user2ID, user1ID];
    const sql = "DELETE FROM FriendShips WHERE User1ID = ? AND User2ID = ?";
    const params = [id1, id2];
    const results = await this.executeQuery(sql, params);
    return results.affectedRows;
  }

  //CONVERSATIONMEMBERS CRUD

  //Add a User to a Conversation
  async addConversationMember(conversationID, userID) {
    const sql =
      "INSERT INTO ConversationMembers (ConversationID, UserID) VALUES (?, ?)";
    const params = [conversationID, userID];
    const results = await this.executeQuery(sql, params);
    return results.affectedRows;
  }

  // Get all members of a Conversation
  async getConversationMembers(conversationID) {
    const sql =
      "SELECT Users.UserID, Users.Username FROM ConversationMembers JOIN Users ON ConversationMembers.UserID = Users.UserID WHERE ConversationID = ?";
    const params = [conversationID];
    return await this.executeQuery(sql, params);
  }

  // Remove a User from a Conversation
  async removeConversationMember(conversationID, userID) {
    const sql =
      "DELETE FROM ConversationMembers WHERE ConversationID = ? AND UserID = ?";
    const params = [conversationID, userID];
    const results = await this.executeQuery(sql, params);
    return results.affectedRows;
  }
}

module.exports = new DatabaseManager();
