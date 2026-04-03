import { getFileFromS3 } from "./s3Service.mjs";

export const handler = async (event) => {
  try {
    const bucketName = process.env.S3_BUCKET_NAME;
    const fileKey = process.env.S3_FILE_KEY || "index/upou_program_catalog.md";

    const content = await getFileFromS3(bucketName, fileKey);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "File fetched successfully from S3",
        fileKey,
        content,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error fetching file from S3",
        error: error.message,
      }),
    };
  }
};