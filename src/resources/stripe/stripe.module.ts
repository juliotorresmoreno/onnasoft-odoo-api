import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { UsersModule } from '../users/users.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  controllers: [StripeController],
  providers: [StripeService],
  imports: [UsersModule, PlansModule],
  exports: [StripeService],
})
export class StripeModule {}
