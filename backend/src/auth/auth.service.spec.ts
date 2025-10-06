import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { User } from "../users/user.entity";
import { RegisterDto, LoginDto, AccountType } from "./auth.dto";

describe("AuthService", () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const registerDto: RegisterDto = {
        email: "test@example.com",
        password: "password123",
        accountType: AccountType.INDIVIDUAL,
        firstName: "John",
        lastName: "Doe",
        companyName: "Test Company",
      };

      const savedUser = {
        id: "1",
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        companyName: registerDto.companyName,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);
      mockJwtService.sign.mockReturnValue("test-token");

      const result = await service.register(registerDto);

      expect(result.access_token).toBe("test-token");
      expect(result.user.email).toBe(registerDto.email);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it("should throw UnauthorizedException if user already exists", async () => {
      const registerDto: RegisterDto = {
        email: "test@example.com",
        password: "password123",
        accountType: AccountType.INDIVIDUAL,
        firstName: "John",
        lastName: "Doe",
      };

      mockUserRepository.findOne.mockResolvedValue({ id: "1" });

      await expect(service.register(registerDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe("login", () => {
    it("should login user with valid credentials", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password123",
      };

      const user = {
        id: "1",
        email: loginDto.email,
        password: await bcrypt.hash(loginDto.password, 10),
        firstName: "John",
        lastName: "Doe",
        companyName: "Test Company",
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue("test-token");

      const result = await service.login(loginDto);

      expect(result.access_token).toBe("test-token");
      expect(result.user.email).toBe(loginDto.email);
    });

    it("should throw UnauthorizedException with invalid email", async () => {
      const loginDto: LoginDto = {
        email: "invalid@example.com",
        password: "password123",
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("should throw UnauthorizedException with invalid password", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const user = {
        id: "1",
        email: loginDto.email,
        password: await bcrypt.hash("password123", 10),
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe("validateUser", () => {
    it("should validate and return user by ID", async () => {
      const user = {
        id: "1",
        email: "test@example.com",
      };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.validateUser("1");

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
      });
    });

    it("should return null if user not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser("invalid-id");

      expect(result).toBeNull();
    });
  });
});
