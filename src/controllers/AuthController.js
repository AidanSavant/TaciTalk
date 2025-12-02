const db = require("../controllers/DatabaseManager")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports = {
    register,
    login
};

async function register(req, res) {
    const { username, password } = req.body;
    
    if(!username || !password) {
        return res.status(400).json({ message: "Username and password are required!" });
    }

    const user = await db.getUser(username);
    if(user !== null) {
        return res.status(409).json({ message: "Username already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.createUser(username, hashedPassword, "");

    const created = await db.getUser(username);
    const token = jwt.sign(
        { userId: created.UserID, username: created.Username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.status(201).json({ message: "User registered successfully!", token });
}

async function login(req, res) {
    const { username, password } = req.body;

    if(!username || !password) {
        return res.status(400).json({ message: "Username and password are required!" });
    }

    const user = await db.getUser(username);
    if(!user) {
        return res.status(401).json({ message: "Invalid username or password!" });
    }

    const passwordMatch = await bcrypt.compare(password, user.Password);
    if(!passwordMatch) {
        return res.status(401).json({ message: "Invalid username or password!" });
    }

    const token = jwt.sign(
        { userId: user.UserID, username: user.Username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful!", token });
}
