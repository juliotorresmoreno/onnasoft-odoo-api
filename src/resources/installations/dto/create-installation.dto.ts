import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

const POSTGRES_DB_NAME_REGEX = /^[a-zA-Z_]\w*$/;

export class CreateInstallationDto {
  @IsOptional()
  @IsString()
  @IsIn(['18.0'])
  version?: string;

  @IsOptional()
  @IsString()
  @IsIn(['community', 'enterprise'])
  edition?: string;

  @IsOptional()
  @IsString()
  licenseKey?: string;

  @IsOptional()
  @Matches(POSTGRES_DB_NAME_REGEX, {
    message: 'database must be a valid PostgreSQL identifier',
  })
  @MaxLength(63, { message: 'database name must be at most 63 characters' })
  database?: string;
}
