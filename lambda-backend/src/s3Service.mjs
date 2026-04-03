import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export async function getFileFromS3(bucketName, fileKey) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  });

  const response = await s3.send(command);
  const content = await response.Body.transformToString();

  return content;
}