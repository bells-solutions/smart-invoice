import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './client.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Post()
  create(
    @Body(ValidationPipe) createClientDto: CreateClientDto,
    @CurrentUser() user: User,
  ) {
    return this.clientsService.create(createClientDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.clientsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.clientsService.findOne(id, user);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateClientDto: UpdateClientDto,
    @CurrentUser() user: User,
  ) {
    return this.clientsService.update(id, updateClientDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.clientsService.remove(id, user);
  }
}
