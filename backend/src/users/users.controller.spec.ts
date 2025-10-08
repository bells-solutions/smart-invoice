import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

// Mock uuid to avoid ES module issues
jest.mock("uuid", () => ({
  v4: jest.fn(() => "mock-uuid"),
}));

describe("UsersController", () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockUser: User = {
    id: "1",
    email: "test@example.com",
    password: "hashedpassword",
    accountType: "individual",
    firstName: "John",
    lastName: "Doe",
    phone: "+1234567890",
    town: "New York",
    address: "123 Main St",
    companyName: null,
    taxpayerNumber: null,
    commercialRegister: null,
    poBox: null,
    companyLogo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    clients: [],
    invoices: [],
    profilePicture: "",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should return the current user profile", async () => {
      const result = await controller.getProfile(mockUser);

      expect(result).toEqual(mockUser);
    });
  });

  describe("updateProfile", () => {
    it("should update user profile and return updated user", async () => {
      const updateData = {
        firstName: "Jane",
        lastName: "Smith",
        phone: "+0987654321",
      };

      const updatedUser = {
        ...mockUser,
        ...updateData,
      };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(mockUser, updateData);

      expect(mockUsersService.update).toHaveBeenCalledWith(
        mockUser.id,
        updateData
      );
      expect(result).toEqual(updatedUser);
    });

    it("should handle partial updates", async () => {
      const updateData = {
        firstName: "Jane",
      };

      const updatedUser = {
        ...mockUser,
        firstName: "Jane",
      };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(mockUser, updateData);

      expect(mockUsersService.update).toHaveBeenCalledWith(
        mockUser.id,
        updateData
      );
      expect(result).toEqual(updatedUser);
    });
  });
});
