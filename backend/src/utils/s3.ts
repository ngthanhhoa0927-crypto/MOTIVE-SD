import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";
import "dotenv/config";

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const uploadToS3 = async (
    fileBuffer: Buffer,
    originalFileName: string,
    mimeType: string,
    folder: string = "uploads"
): Promise<string> => {
    // Determine file extension
    const ext = path.extname(originalFileName);
    
    // Generate unique filename
    const uniqueFileName = `${folder}/${crypto.randomUUID()}${ext}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: uniqueFileName,
        Body: fileBuffer,
        ContentType: mimeType,
        // Typically we want public read for images like product/profile ones
        // Adjust ACL as needed by your bucket policy
        // ACL: "public-read",
    });

    await s3Client.send(command);

    // Instead of returning the public URL directly, we return the internal Key (path)
    // The front-end will request a presigned URL when it needs to read it
    return uniqueFileName;
};

/**
 * Generate a short-lived Presigned URL to read a private object from S3.
 * @param key The internal S3 Key (e.g. 'profiles/uuid.png')
 * @param expiresIn Time in seconds until the URL expires (default 1 hour)
 */
export const getPresignedDownloadUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
    // If it's already a full http URL (e.g. from an old system or mock data), just return it
    if (key.startsWith("http")) return key;

    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
};
