import { IsOptional, IsIn, IsString, Length } from 'class-validator';
import * as moment from 'moment-timezone';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Language, languages } from '@/utils/language';

export class UpdateAccountDto {
  @ApiPropertyOptional({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

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
    example: 'America/New_York',
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
  newsletter?: boolean;
}
