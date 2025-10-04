import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clientService } from './clients';
import api from './api';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Client Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all clients', async () => {
      const mockClients = [
        {
          id: '1',
          name: 'Client 1',
          email: 'client1@example.com',
        },
        {
          id: '2',
          name: 'Client 2',
          email: 'client2@example.com',
        },
      ];

      vi.mocked(api.get).mockResolvedValue({ data: mockClients });

      const result = await clientService.getAll();

      expect(api.get).toHaveBeenCalledWith('/clients');
      expect(result).toEqual(mockClients);
    });
  });

  describe('getOne', () => {
    it('should fetch a single client', async () => {
      const mockClient = {
        id: '1',
        name: 'Client 1',
        email: 'client1@example.com',
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockClient });

      const result = await clientService.getOne('1');

      expect(api.get).toHaveBeenCalledWith('/clients/1');
      expect(result).toEqual(mockClient);
    });
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const newClient = {
        name: 'New Client',
        email: 'newclient@example.com',
        phone: '1234567890',
      };

      const mockResponse = {
        id: '1',
        ...newClient,
      };

      vi.mocked(api.post).mockResolvedValue({ data: mockResponse });

      const result = await clientService.create(newClient);

      expect(api.post).toHaveBeenCalledWith('/clients', newClient);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('update', () => {
    it('should update an existing client', async () => {
      const updateData = {
        name: 'Updated Client',
        email: 'updated@example.com',
      };

      const mockResponse = {
        id: '1',
        ...updateData,
      };

      vi.mocked(api.put).mockResolvedValue({ data: mockResponse });

      const result = await clientService.update('1', updateData);

      expect(api.put).toHaveBeenCalledWith('/clients/1', updateData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a client', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: {} });

      await clientService.delete('1');

      expect(api.delete).toHaveBeenCalledWith('/clients/1');
    });
  });
});
