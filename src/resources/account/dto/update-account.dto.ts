import { IsOptional, IsIn, IsString, Length, IsBoolean } from 'class-validator';
import * as moment from 'moment-timezone';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Language, languages } from '@/utils/language';

export class UpdateAccountDto {
  @ApiPropertyOptional({
    description: 'First name of the user',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the user',
    example: '3123749187',
  })
  @IsOptional()
  @IsString()
  @Length(5, 20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Preferred language',
    enum: languages,
    example: 'en',
  })
  @IsOptional()
  @IsIn(languages)
  language?: Language;

  @ApiPropertyOptional({
    description: 'Timezone (IANA format)',
    enum: moment.tz.names(),
    example: 'America/Bogota',
  })
  @IsOptional()
  @IsString()
  @IsIn(moment.tz.names())
  timezone?: string;

  @ApiPropertyOptional({
    description: 'Newsletter subscription status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  newsletter?: boolean;
}
