const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    // console.log("Register request received");

    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(409).json({ msg: "User with this email already exists" });
    }

    const existingUsername = await db.collection('users').findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ msg: "Username already taken" });
    }

    await db.collection('users').insertOne({
      email,
      username,
      password,
    });

    return res.status(201).json({ msg: "User registration successful" });
  } catch (error) {
    console.error("Error in user registration:", error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = router;
