import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ValidateIf,
} from "class-validator";

export class CreateClientDto {
  @ValidateIf((o) => o.clientType === "individual")
  @IsNotEmpty()
  name?: string;

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

  @ValidateIf((o) => o.clientType === "company")
  @IsNotEmpty()
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
