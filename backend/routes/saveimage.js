const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

router.post('/', async (req, res) => {
    const { userId, imageName } = req.body;

    if (!userId || !imageName) {
        return res.status(400).json({ error: 'User ID and Image Name are required.' });
    }

    try {
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: { profileImage: imageName } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ message: 'Profile image updated successfully.' });
    } catch (error) {
        console.error('Error saving image name:', error);
        res.status(500).json({ error: 'Failed to save image name.' });
    }
});

module.exports = router;
