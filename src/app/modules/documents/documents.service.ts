import { Storage } from "@google-cloud/storage";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";

import { User } from "../user/user.model";
import pdfParse from "pdf-parse";
import config from "../../config";

const storage = new Storage({
  keyFilename: "./work.json",
  projectId: "vast-pride-453709-n7",
});
const bucketName = config.bucket;

if (!bucketName) {
  throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Google Cloud bucket name is not configured");
}
const bucket = storage.bucket(bucketName);

const UploadDocumentToGCS = async (file: any, payload: any) => {
  const { entityId, file_type } = payload;
  try {
    if (!file) throw new AppError(httpStatus.BAD_REQUEST, "No file provided");

    const sanitizedName = file.originalname.replace(/\s+/g, "-");
    const fileName = `${Date.now()}-${sanitizedName}`;
    const gcsFile = bucket.file(fileName);

    await new Promise((resolve, reject) => {
      const stream = gcsFile.createWriteStream({
        metadata: { contentType: file.mimetype },
      });

      stream.on("error", (err) => {
        console.error("Error during file upload:", err);
        reject(err);
      });

      stream.on("finish", async () => {
        try {
          await gcsFile.makePublic();
          resolve(true);
        } catch (err) {
          console.error("Error making the file public:", err);
          reject(err);
        }
      });

      stream.end(file.buffer);
    });

    const fileUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    if (file_type === "userProfile") {
      const user = await User.findById(entityId);
      if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

      user.image = fileUrl;
      await user.save();

      return { entityId, file_type, fileUrl };
    } else {
      return { entityId, file_type, fileUrl };
    }
  } catch (error) {
    console.error("File upload failed:", error);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "File upload failed");
  }
};

export const UploadDocumentService = {
  UploadDocumentToGCS,
};
