import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../config/s3.js";

// Uploads a multer file buffer to S3 under `${folder}/<timestamp>-<originalname>`
// and returns its public URL.
export const uploadFileToS3 = async (file, folder) => {
  const fileName = `${folder}/${Date.now()}-${file.originalname}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};
