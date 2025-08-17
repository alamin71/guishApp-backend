import AWS from 'aws-sdk';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import config from '../../app/config';

const s3 = new AWS.S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region,
});

// export const uploadFromUrlToS3 = async (
//   fileUrl: string,
//   folder = 'wallet/aiImage/',
// ) => {
//   const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
//   const fileExtension = path.extname(new URL(fileUrl).pathname) || '.png';
//   const fileName = `${folder}${uuidv4()}${fileExtension}`;

//   const uploadParams = {
//     Bucket: config.aws.bucket!,
//     Key: fileName,
//     Body: response.data,
//     ContentType: 'image/png',
//     // ACL: 'public-read',
//   };

//   await s3.upload(uploadParams).promise();

//   return `https://${config.aws.bucket}.s3.${config.aws.region}.amazonaws.com/${fileName}`;
// };
export const uploadFromUrlToS3 = async (
  fileUrl: string,
  folder = 'wallet/aiImage/',
) => {
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  const fileExtension = path.extname(new URL(fileUrl).pathname) || '.png';
  const generatedId = uuidv4(); // Generate unique ID
  const fileName = `${folder}${generatedId}${fileExtension}`;

  const uploadParams = {
    Bucket: config.aws.bucket!,
    Key: fileName,
    Body: response.data,
    ContentType: 'image/png',
    // ACL: 'public-read', // ⚠️ Skip this if bucket doesn't allow it
  };

  await s3.upload(uploadParams).promise();

  const imageUrl = `https://${config.aws.bucket}.s3.${config.aws.region}.amazonaws.com/${fileName}`;

  // ✅ Return full object for Mongoose schema
  return {
    id: generatedId,
    url: imageUrl,
  };
};
