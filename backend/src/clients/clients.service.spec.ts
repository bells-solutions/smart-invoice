import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './client.entity';
import { User } from '../users/user.entity';
import { CreateClientDto, UpdateClientDto } from './client.dto';

describe('ClientsService', () => {
  let service: ClientsService;
  let clientRepository: Repository<Client>;

  const mockClientRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed',
    firstName: 'John',
    lastName: 'Doe',
    companyName: 'Test Company',
    companyLogo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    clients: [],
    invoices: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useValue: mockClientRepository,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    clientRepository = module.get<Repository<Client>>(
      getRepositoryToken(Client),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const createClientDto: CreateClientDto = {
        name: 'Client Name',
        email: 'client@example.com',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
      };

      const client = {
        id: 'client-1',
        ...createClientDto,
        userId: mockUser.id,
      };

      mockClientRepository.create.mockReturnValue(client);
      mockClientRepository.save.mockResolvedValue(client);

      const result = await service.create(createClientDto, mockUser);

      expect(result).toEqual(client);
      expect(mockClientRepository.create).toHaveBeenCalledWith({
        ...createClientDto,
        userId: mockUser.id,
      });
      expect(mockClientRepository.save).toHaveBeenCalledWith(client);
    });
  });

  describe('findAll', () => {
    it('should return all clients for a user', async () => {
      const clients = [
        {
          id: 'client-1',
          name: 'Client 1',
          email: 'client1@example.com',
          userId: mockUser.id,
        },
        {
          id: 'client-2',
          name: 'Client 2',
          email: 'client2@example.com',
          userId: mockUser.id,
        },
      ];

      mockClientRepository.find.mockResolvedValue(clients);

      const result = await service.findAll(mockUser);

      expect(result).toEqual(clients);
      expect(mockClientRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a client by ID', async () => {
      const client = {
        id: 'client-1',
        name: 'Client 1',
        email: 'client1@example.com',
        userId: mockUser.id,
      };

      mockClientRepository.findOne.mockResolvedValue(client);

      const result = await service.findOne('client-1', mockUser);

      expect(result).toEqual(client);
      expect(mockClientRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'client-1', userId: mockUser.id },
      });
    });

    it('should throw NotFoundException if client not found', async () => {
      mockClientRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      const updateClientDto: UpdateClientDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const client = {
        id: 'client-1',
        name: 'Original Name',
        email: 'original@example.com',
        userId: mockUser.id,
      };

      const updatedClient = {
        ...client,
        ...updateClientDto,
      };

      mockClientRepository.findOne.mockResolvedValue(client);
      mockClientRepository.save.mockResolvedValue(updatedClient);

      const result = await service.update('client-1', updateClientDto, mockUser);

      expect(result).toEqual(updatedClient);
      expect(mockClientRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a client', async () => {
      const client = {
        id: 'client-1',
        name: 'Client 1',
        userId: mockUser.id,
      };

      mockClientRepository.findOne.mockResolvedValue(client);
      mockClientRepository.remove.mockResolvedValue(client);

      const result = await service.remove('client-1', mockUser);

      expect(result).toEqual({ deleted: true });
      expect(mockClientRepository.remove).toHaveBeenCalledWith(client);
    });
  });
});
