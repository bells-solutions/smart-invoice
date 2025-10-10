import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  UseGuards,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsersService } from "./users.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { User } from "./user.entity";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { UpdateUserDto } from "./user.dto";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("me")
  async getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Put("me")
  async updateProfile(
    @CurrentUser() user: User,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Post("me/profile-picture")
  @UseInterceptors(
    FileInterceptor("profilePicture", {
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException("Only image files are allowed!"),
            false
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    })
  )
  async uploadProfilePicture(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    return this.usersService.updateProfilePicture(user.id, file);
  }

  @Delete("me/profile-picture")
  async deleteProfilePicture(@CurrentUser() user: User) {
    return this.usersService.deleteProfilePicture(user.id);
  }

  @Post("me/company-logo")
  @UseInterceptors(
    FileInterceptor("companyLogo", {
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new BadRequestException("Only image files are allowed!"),
            false
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    })
  )
  async uploadCompanyLogo(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    return this.usersService.updateCompanyLogo(user.id, file);
  }

  @Delete("me/company-logo")
  async deleteCompanyLogo(@CurrentUser() user: User) {
    return this.usersService.deleteCompanyLogo(user.id);
  }
}
