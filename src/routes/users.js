const express = require("express");
const { User } = require("../models/User");

const router = express.Router();

// Add a user
router.post("/", async (req, res) => {
  try {
    const { name, userId, fingerprintId } = req.body;
    if (!name || !userId || fingerprintId === undefined) {
      return res.status(400).json({ message: "name, userId, fingerprintId are required" });
    }

    const exists = await User.findOne({
      $or: [{ userId }, { fingerprintId }],
    });
    if (exists) {
      return res.status(409).json({ message: "userId or fingerprintId already exists" });
    }

    const user = await User.create({ name, userId, fingerprintId });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
