import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from '@/entities/Plan';
import { PlanTranslation } from '@/entities/PlanTranslation';
import { StripeModule } from '@/resources/stripe/stripe.module';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, PlanTranslation]), StripeModule],
  providers: [SeedService, ConfigService],
  exports: [SeedService],
})
export class SeedModule {}
