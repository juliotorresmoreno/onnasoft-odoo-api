import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SelectPlanDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the plan to select',
    example: 'plan_12345',
  })
  planId: string;
}
