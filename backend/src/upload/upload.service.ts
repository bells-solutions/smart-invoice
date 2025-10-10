import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Minio from "minio";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private minioClient: Minio.Client;
  private bucketName = "smart-invoice";

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get("MINIO_ENDPOINT", "localhost"),
      port: parseInt(this.configService.get("MINIO_PORT", "9000")),
      useSSL: this.configService.get("MINIO_USE_SSL", "false") === "true",
      accessKey: this.configService.get("MINIO_ACCESS_KEY", "minioadmin"),
      secretKey: this.configService.get("MINIO_SECRET_KEY", "minioadmin123"),
    });

    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, "us-east-1");
        this.logger.log(`Bucket ${this.bucketName} created successfully`);

        // Set bucket policy to allow public read access for profile pictures and company logos
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                AWS: ["*"],
              },
              Action: ["s3:GetObject"],
              Resource: [
                `arn:aws:s3:::${this.bucketName}/profile-pictures/*`,
                `arn:aws:s3:::${this.bucketName}/company-logos/*`,
              ],
            },
          ],
        };

        await this.minioClient.setBucketPolicy(
          this.bucketName,
          JSON.stringify(policy)
        );
        this.logger.log(`Bucket policy set for ${this.bucketName}`);
      }
    } catch (error) {
      this.logger.error("Error initializing bucket:", error);
    }
  }

  async uploadProfilePicture(
    file: Express.Multer.File,
    userId: string
  ): Promise<string> {
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `profile-pictures/${userId}-${uuidv4()}.${fileExtension}`;

    try {
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
        {
          "Content-Type": file.mimetype,
        }
      );

      // Return the public URL
      const baseUrl = `http://${this.configService.get(
        "MINIO_ENDPOINT",
        "localhost"
      )}:${this.configService.get("MINIO_PORT", "9000")}`;
      return `${baseUrl}/${this.bucketName}/${fileName}`;
    } catch (error) {
      this.logger.error("Error uploading file:", error);
      throw new Error("Failed to upload profile picture");
    }
  }

  async deleteProfilePicture(fileUrl: string): Promise<void> {
    try {
      // Extract the object name from the URL
      const objectName = fileUrl.split(`/${this.bucketName}/`)[1];
      if (objectName) {
        await this.minioClient.removeObject(this.bucketName, objectName);
        this.logger.log(`Deleted file: ${objectName}`);
      }
    } catch (error) {
      this.logger.error("Error deleting file:", error);
    }
  }

  async uploadCompanyLogo(
    file: Express.Multer.File,
    userId: string
  ): Promise<string> {
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `company-logos/${userId}-${uuidv4()}.${fileExtension}`;

    try {
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
        {
          "Content-Type": file.mimetype,
        }
      );

      // Return the public URL
      const baseUrl = `http://${this.configService.get(
        "MINIO_ENDPOINT",
        "localhost"
      )}:${this.configService.get("MINIO_PORT", "9000")}`;
      return `${baseUrl}/${this.bucketName}/${fileName}`;
    } catch (error) {
      this.logger.error("Error uploading company logo:", error);
      throw new Error("Failed to upload company logo");
    }
  }

  async deleteCompanyLogo(fileUrl: string): Promise<void> {
    try {
      // Extract the object name from the URL
      const objectName = fileUrl.split(`/${this.bucketName}/`)[1];
      if (objectName) {
        await this.minioClient.removeObject(this.bucketName, objectName);
        this.logger.log(`Deleted company logo: ${objectName}`);
      }
    } catch (error) {
      this.logger.error("Error deleting company logo:", error);
    }
  }
}
