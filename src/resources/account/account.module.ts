import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  controllers: [AccountController],
  providers: [AccountService],
  imports: [UsersModule, NotificationsModule, StripeModule],
})
export class AccountModule {}
