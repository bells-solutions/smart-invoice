import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { UploadService } from "../upload/upload.service";

// Mock uuid to avoid ES module issues
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-uuid"),
}));

describe("UsersService", () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockUploadService = {
    uploadProfilePicture: jest.fn(),
    deleteProfilePicture: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findOne", () => {
    it("should return a user when found", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        accountType: "individual" as const,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne("1");

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne("nonexistent-id");

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: "nonexistent-id" },
      });
      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update user and return updated user", async () => {
      const updateData = {
        firstName: "Jane",
        lastName: "Smith",
      };

      const existingUser = {
        id: "1",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        accountType: "individual" as const,
      };

      const updatedUser = {
        ...existingUser,
        ...updateData,
      };

      mockUserRepository.update.mockResolvedValue(undefined);
      mockUserRepository.findOne.mockResolvedValue(updatedUser);

      const result = await service.update("1", updateData);

      expect(mockUserRepository.update).toHaveBeenCalledWith("1", updateData);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(result).toEqual(updatedUser);
    });

    it("should throw error when user not found after update", async () => {
      const updateData = {
        firstName: "Jane",
      };

      mockUserRepository.update.mockResolvedValue(undefined);
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update("1", updateData)).rejects.toThrow(
        "User not found"
      );
    });
  });
});
