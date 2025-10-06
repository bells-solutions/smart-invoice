import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
} from "class-validator";

export enum AccountType {
  INDIVIDUAL = "individual",
  COMPANY = "company",
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(AccountType)
  accountType: AccountType;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  town?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  companyName?: string;

  @IsOptional()
  taxpayerNumber?: string;

  @IsOptional()
  commercialRegister?: string;

  @IsOptional()
  poBox?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
