import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import config from '../../app/config';

const s3 = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId!,
    secretAccessKey: config.aws.secretAccessKey!,
  },
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

  await s3.send(new PutObjectCommand(uploadParams));

  const imageUrl = `https://${config.aws.bucket}.s3.${config.aws.region}.amazonaws.com/${fileName}`;

  return {
    id: generatedId,
    url: imageUrl,
  };
};
