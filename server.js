const express = require('express');
const fs = require('fs').promises;
const aws = require('aws-sdk');
const path = require('path');
const cors = require('cors')

const app = express();
const port = 80;

const s3 = new aws.S3();

app.use(cors());

// Helper function to get signed URL
function getSignedUrl({ url, keyPairId, dateLessThan, privateKey }) {
  const cloudFront = new aws.CloudFront.Signer(keyPairId, privateKey);

  const policy = JSON.stringify({
    Statement: [
      {
        Resource: url,
        Condition: {
          DateLessThan: { 'AWS:EpochTime': Math.floor(new Date(dateLessThan).getTime() / 1000) },
        },
      },
    ],
  });

  return cloudFront.getSignedUrl({
    url,
    policy,
  });
}

app.get('/videoList', async (req, res) => {
  try {
    const bucketName = 'your-bucket-name';  
    const privateKeyPath = '/key.pem';  

    // Read the private key
    const privateKey = await fs.readFile(privateKeyPath, 'utf8');
    
    const cloudfrontDistributionDomain = "https://your-cloudfront-domain";  
    const keyPairId = "your-key-pair-id";  
    const dateLessThan = "2024-12-12";  

    // List all objects in the S3 bucket
    const s3Objects = await s3.listObjectsV2({ Bucket: bucketName }).promise();
    
    const signedUrls = s3Objects.Contents.map(s3Object => {
      const s3ObjectKey = s3Object.Key;
      const url = `${cloudfrontDistributionDomain}/${s3ObjectKey}`;
      
      return {
        fileName: s3ObjectKey,
        url: getSignedUrl({
          url,
          keyPairId,
          dateLessThan,
          privateKey,
        })
      };
    });

    // Send the signed URLs as a response
    res.json(signedUrls);
  } catch (error) {
    console.error('Error generating signed URLs:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
