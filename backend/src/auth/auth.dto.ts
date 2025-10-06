import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
  ValidateIf,
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

  @ValidateIf((o) => o.accountType === AccountType.INDIVIDUAL)
  @IsNotEmpty({ message: "First name is required for individual accounts" })
  @IsOptional()
  firstName?: string;

  @ValidateIf((o) => o.accountType === AccountType.INDIVIDUAL)
  @IsNotEmpty({ message: "Last name is required for individual accounts" })
  @IsOptional()
  lastName?: string;

  @ValidateIf((o) => o.accountType === AccountType.INDIVIDUAL)
  @IsNotEmpty({ message: "Phone is required for individual accounts" })
  @IsOptional()
  phone?: string;

  @ValidateIf((o) => o.accountType === AccountType.COMPANY)
  @IsNotEmpty({ message: "Town is required for company accounts" })
  @IsOptional()
  town?: string;

  @IsOptional()
  address?: string;

  @ValidateIf((o) => o.accountType === AccountType.COMPANY)
  @IsNotEmpty({ message: "Company name is required for company accounts" })
  @IsOptional()
  companyName?: string;

  @ValidateIf((o) => o.accountType === AccountType.COMPANY)
  @IsNotEmpty({ message: "Taxpayer number is required for company accounts" })
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
