import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  companyName: string;

  @ApiProperty()
  @IsString()
  companySize: string;

  @ApiProperty()
  @IsString()
  industry: string;

  @ApiProperty()
  @IsString()
  position: string;

  @ApiProperty()
  @IsString()
  @Length(8, 255)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long and include uppercase, lowercase, number and special character',
    },
  )
  password: string;

  @ApiProperty()
  @IsBoolean()
  acceptTerms: boolean;

  @ApiProperty()
  @IsBoolean()
  acceptMarketing: boolean;
}
