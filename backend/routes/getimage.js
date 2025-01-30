const dotenv = require('dotenv');
dotenv.config();

const { S3Client } = require("@aws-sdk/client-s3");
const express = require('express');

const router = express.Router();

const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await db.collection('users').findOne({ username });

    if (!user || !user.profileImage) {
      return res.status(200).json({ imageUrl: '/default.jpg' });
    }

    const s3Client = new S3Client({ 
      region: process.env.BUCKET_REGION,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
      }
    });

    const key = `profile-images/${user.profileImage}`;

    const command = new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key
    });

    const imageUrl = await getSignedUrl(s3Client, command, { expiresIn: 7200 });
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error retrieving image URL:', error);
    res.status(500).json({ error: 'Failed to retrieve image URL' });
  }
});

module.exports = router;