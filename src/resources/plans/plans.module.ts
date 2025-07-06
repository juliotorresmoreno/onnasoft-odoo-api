import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from '@/entities/Plan';

@Module({
  controllers: [PlansController],
  providers: [PlansService],
  imports: [TypeOrmModule.forFeature([Plan])],
})
export class PlansModule {}
