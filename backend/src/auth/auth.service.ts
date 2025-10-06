import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../users/user.entity";
import { RegisterDto, LoginDto } from "./auth.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    // Normalize incoming DTO: convert blank strings to undefined so optional fields aren't stored as empty strings
    const normalize = <T extends Record<string, any>>(obj: T) =>
      Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [
          k,
          typeof v === "string" && v.trim() === "" ? undefined : v,
        ])
      ) as T;

    const {
      email,
      password,
      accountType,
      firstName,
      lastName,
      phone,
      town,
      address,
      companyName,
      taxpayerNumber,
      commercialRegister,
      poBox,
    } = normalize(registerDto as any) as RegisterDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new UnauthorizedException("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      accountType,
      firstName,
      lastName,
      phone,
      town,
      address,
      companyName,
      taxpayerNumber,
      commercialRegister,
      poBox,
    });

    await this.usersRepository.save(user);

    // Generate token
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        accountType: user.accountType,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        town: user.town,
        address: user.address,
        companyName: user.companyName,
        taxpayerNumber: user.taxpayerNumber,
        commercialRegister: user.commercialRegister,
        poBox: user.poBox,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        accountType: user.accountType,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        town: user.town,
        address: user.address,
        companyName: user.companyName,
        taxpayerNumber: user.taxpayerNumber,
        commercialRegister: user.commercialRegister,
        poBox: user.poBox,
      },
    };
  }

  async validateUser(userId: string) {
    return await this.usersRepository.findOne({ where: { id: userId } });
  }
}
