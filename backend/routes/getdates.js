const express = require('express');
const router = express.Router();

router.get('/:username', async (req, res) => {
    try {
        const user = await db.collection('users').findOne({ username: req.params.username });
        res.json({ submissionDates: user?.submissionDates || [] });
    } catch (error) {
        console.error("Error fetching submission dates:", error);
        res.status(500).json({ error: 'Failed to fetch submission dates' });
    }
    });

  module.exports = router;