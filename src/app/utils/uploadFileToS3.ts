import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import config from '../../app/config';

const s3 = new AWS.S3({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region,
});

export const uploadFileToS3 = async (
  file: Express.Multer.File,
  folder = 'category/',
) => {
  const fileExtension = path.extname(file.originalname) || '.png';
  const generatedId = uuidv4();
  const fileName = `${folder}${generatedId}${fileExtension}`;

  const uploadParams = {
    Bucket: config.aws.bucket!,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3.upload(uploadParams).promise();

  const imageUrl = `https://${config.aws.bucket}.s3.${config.aws.region}.amazonaws.com/${fileName}`;

  return {
    id: generatedId,
    url: imageUrl,
  };
};
