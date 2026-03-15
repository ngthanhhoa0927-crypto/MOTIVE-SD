import { Hono } from "hono";
import { uploadToS3, getPresignedDownloadUrl } from "../utils/s3.js";

const fileRouter = new Hono();

fileRouter.post("/upload", async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body['file'];

        if (!file || !(file instanceof File)) {
            return c.json({ message: "No valid file uploaded" }, 400);
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to S3
        const folder = body['folder'] ? String(body['folder']) : "general";
        const fileKey = await uploadToS3(buffer, file.name, file.type, folder);
        const signedUrl = await getPresignedDownloadUrl(fileKey);

        return c.json({
            message: "File uploaded successfully",
            key: fileKey,
            url: signedUrl
        }, 200);

    } catch (error) {
        console.error("Upload error:", error);
        return c.json({ message: "Failed to upload file to S3" }, 500);
    }
});

export default fileRouter;
