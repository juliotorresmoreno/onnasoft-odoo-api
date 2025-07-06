import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from '@/entities/Plan';
import { PlanTranslation } from '@/entities/PlanTranslation';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, PlanTranslation])],
  providers: [SeedService, ConfigService],
  exports: [SeedService],
})
export class SeedModule {}
