import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateContactDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(2)
  company?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(2)
  phone?: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  subject: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  message: string;
}
