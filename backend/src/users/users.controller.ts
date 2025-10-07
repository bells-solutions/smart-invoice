import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
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
}
