import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { UploadService } from "../upload/upload.service";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private uploadService: UploadService
  ) {}

  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, updateData);
    const updatedUser = await this.findOne(id);
    if (!updatedUser) {
      throw new Error("User not found");
    }
    return updatedUser;
  }

  async updateProfilePicture(
    userId: string,
    file: Express.Multer.File
  ): Promise<User> {
    // Get current user to check if they have an existing profile picture
    const user = await this.findOne(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Delete old profile picture if it exists
    if (user.profilePicture) {
      await this.uploadService.deleteProfilePicture(user.profilePicture);
    }

    // Upload new profile picture
    const profilePictureUrl = await this.uploadService.uploadProfilePicture(
      file,
      userId
    );

    // Update user with new profile picture URL
    await this.usersRepository.update(userId, {
      profilePicture: profilePictureUrl,
    });

    return this.findOne(userId);
  }

  async deleteProfilePicture(userId: string): Promise<User> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Delete profile picture from storage if it exists
    if (user.profilePicture) {
      await this.uploadService.deleteProfilePicture(user.profilePicture);
    }

    // Remove profile picture URL from user
    await this.usersRepository.update(userId, { profilePicture: null });

    return this.findOne(userId);
  }

  async updateCompanyLogo(
    userId: string,
    file: Express.Multer.File
  ): Promise<User> {
    // Get current user to check if they have an existing company logo
    const user = await this.findOne(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Delete old company logo if it exists
    if (user.companyLogo) {
      await this.uploadService.deleteCompanyLogo(user.companyLogo);
    }

    // Upload new company logo
    const companyLogoUrl = await this.uploadService.uploadCompanyLogo(
      file,
      userId
    );

    // Update user with new company logo URL
    await this.usersRepository.update(userId, {
      companyLogo: companyLogoUrl,
    });

    return this.findOne(userId);
  }

  async deleteCompanyLogo(userId: string): Promise<User> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Delete company logo from storage if it exists
    if (user.companyLogo) {
      await this.uploadService.deleteCompanyLogo(user.companyLogo);
    }

    // Remove company logo URL from user
    await this.usersRepository.update(userId, { companyLogo: null });

    return this.findOne(userId);
  }
}
