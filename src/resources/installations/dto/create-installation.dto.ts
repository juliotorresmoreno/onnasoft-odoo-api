import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const POSTGRES_DB_NAME_REGEX = /^[a-zA-Z_]\w*$/;

export class CreateInstallationDto {
  @ApiProperty()
  @IsString()
  @IsIn(['18.0'])
  version: string;

  @ApiProperty()
  @IsString()
  @IsIn(['community', 'enterprise'])
  edition: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  licenseKey?: string;

  @ApiProperty()
  @IsString({ message: 'Password must be a string.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @MaxLength(255, { message: 'Password cannot exceed 255 characters.' })
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter.',
  })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter.',
  })
  @Matches(/\d/, {
    message: 'Password must contain at least one number.',
  })
  @Matches(/[@$!%*?&.#=]/, {
    message:
      'Password must contain at least one special character (@$!%*?&.#).',
  })
  password: string;

  @ApiProperty()
  @IsString()
  @Matches(POSTGRES_DB_NAME_REGEX, {
    message: 'database must be a valid PostgreSQL identifier',
  })
  @MaxLength(63, { message: 'database name must be at most 63 characters' })
  database: string;
}
