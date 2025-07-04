import { defaultLanguage, Language, languages } from '@/utils/language';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterAuthDto {
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
  @IsIn(['1-10', '11-50', '51-200', '201-500', '500+'])
  companySize: string;

  @ApiProperty()
  @IsString()
  @IsIn([
    'manufacturing',
    'retail',
    'services',
    'technology',
    'healthcare',
    'education',
    'finance',
    'other',
  ])
  industry: string;

  @ApiProperty()
  @IsString()
  @IsIn(['ceo', 'cto', 'manager', 'it', 'operations', 'finance', 'other'])
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

  @ApiProperty({
    description: 'Preferred language',
    enum: languages,
    example: defaultLanguage,
  })
  @IsString()
  @IsIn(languages)
  language: Language;

  @ApiProperty()
  @IsBoolean()
  acceptTerms: boolean;

  @ApiProperty()
  @IsBoolean()
  acceptMarketing: boolean;
}
