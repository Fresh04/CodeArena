const express = require('express');
const router = express.Router();

router.get('/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await db.collection('users').findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      _id: user._id,
      username: user.username,
      problemsSolved: user.problemsSolved || 0,
      accuracy: user.accuracy || '0%',
      photo: user.profileImage || '/default-profile.png',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
