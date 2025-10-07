import { IsEmail, IsNotEmpty, IsOptional, IsEnum } from "class-validator";

export class CreateClientDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  country?: string;

  @IsEnum(["individual", "company"])
  clientType: "individual" | "company";

  @IsOptional()
  companyName?: string;

  @IsOptional()
  taxpayerNumber?: string;

  @IsOptional()
  commercialRegister?: string;
}

export class UpdateClientDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  country?: string;

  @IsOptional()
  @IsEnum(["individual", "company"])
  clientType?: "individual" | "company";

  @IsOptional()
  companyName?: string;

  @IsOptional()
  taxpayerNumber?: string;

  @IsOptional()
  commercialRegister?: string;
}
