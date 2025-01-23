const dotenv = require('dotenv');
dotenv.config();

const { S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const express = require('express');

const router = express.Router();

router.post('/', async (req, res) => {
   const { fileName, fileType } = req.body;
   const key = `profile-images/${fileName}`;

   const command = new PutObjectCommand({
       Bucket: process.env.BUCKET_NAME,
       Key: key,
       ContentType: fileType
   });

   try {
       const s3Client = new S3Client({ 
           region: process.env.BUCKET_REGION,
           credentials: {
               accessKeyId: process.env.ACCESS_KEY,
               secretAccessKey: process.env.SECRET_ACCESS_KEY
           }
       });

       const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 60 });
       const publicURL = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${key}`;
       
       res.json({ uploadURL, publicURL });
   } catch (error) {
       console.error('Upload URL generation error:', error);
       res.status(500).json({ error: 'Failed to generate upload URL' });
   }
});

module.exports = router;