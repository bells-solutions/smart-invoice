import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto, UpdateClientDto } from './client.dto';
import { User } from '../users/user.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto, user: User) {
    const client = this.clientsRepository.create({
      ...createClientDto,
      userId: user.id,
    });
    return await this.clientsRepository.save(client);
  }

  async findAll(user: User) {
    return await this.clientsRepository.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User) {
    const client = await this.clientsRepository.findOne({
      where: { id, userId: user.id },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto, user: User) {
    const client = await this.findOne(id, user);
    Object.assign(client, updateClientDto);
    return await this.clientsRepository.save(client);
  }

  async remove(id: string, user: User) {
    const client = await this.findOne(id, user);
    await this.clientsRepository.remove(client);
    return { deleted: true };
  }
}
