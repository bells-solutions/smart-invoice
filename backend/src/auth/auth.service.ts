import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { User } from "../users/user.entity";
import { RegisterDto, LoginDto } from "./auth.dto";
// import { MailService } from "../mail/mail.service"; // Mail functionality disabled

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService
    // private mailService: MailService // Mail functionality disabled
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
        currency: user.currency,
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
        currency: user.currency,
      },
    };
  }

  async validateUser(userId: string) {
    return await this.usersRepository.findOne({ where: { id: userId } });
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        message: "If the email exists, a password reset link has been sent.",
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to user
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await this.usersRepository.save(user);

    // Send email - DISABLED
    // try {
    //   await this.mailService.sendPasswordResetEmail(user, resetToken);
    // } catch (error) {
    //   console.error("Failed to send password reset email:", error);
    //   // Don't throw error to avoid revealing if email exists
    // }

    return {
      message: "If the email exists, a password reset link has been sent.",
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersRepository.findOne({
      where: {
        passwordResetToken: token,
      },
    });

    if (
      !user ||
      !user.passwordResetExpires ||
      new Date() > user.passwordResetExpires
    ) {
      throw new UnauthorizedException("Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.usersRepository.save(user);

    return { message: "Password successfully reset" };
  }

  async sendEmailVerification(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    if (user.emailVerified) {
      return { message: "Email is already verified" };
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = verificationToken;
    await this.usersRepository.save(user);

    // Send verification email - DISABLED
    // await this.mailService.sendEmailVerification(user, verificationToken);

    return { message: "Verification email sent" };
  }

  async verifyEmail(token: string) {
    const user = await this.usersRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid verification token");
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    await this.usersRepository.save(user);

    return { message: "Email successfully verified" };
  }
}
