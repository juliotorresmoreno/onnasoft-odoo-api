import * as fs from 'fs';
import { Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService as NestConfigService,
} from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './resources/auth/auth.module';
import { UsersModule } from './resources/users/users.module';
import configuration from './config/configuration';
import { validate } from './config/config.schema';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@/config/config.service';
import { Configuration } from './types/configuration';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { EmailService } from './services/email/email.service';
import { EmailModule } from './services/email/email.module';
import { ContactModule } from './resources/contact/contact.module';
import { AccountModule } from './resources/account/account.module';
import { NotificationsModule } from './resources/notifications/notifications.module';
import { StripeModule } from './resources/stripe/stripe.module';
import { User } from './entities/User';
import { Notification } from './entities/Notification';
import { Company } from './entities/Company';
import { CompanyModule } from './resources/company/company.module';

const envPath = `.env.${process.env.NODE_ENV ?? 'development'}`;
const envFileExists = fs.existsSync(envPath);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envPath,
      ignoreEnvFile: !envFileExists,
      load: [configuration],
      validate: validate,
    }),
    TypeOrmModule.forRootAsync({
      useFactory(configService: ConfigService) {
        const configuration = configService.get('config') as Configuration;
        return {
          ...configuration.database,
          entities: [User, Company, Notification],
          synchronize: true,
        } as TypeOrmModuleOptions;
      },
      inject: [NestConfigService],
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const jwtConfig = configService.get('config') as Configuration;
        return {
          secret: jwtConfig.secret,
          signOptions: { expiresIn: 36000 },
        };
      },
      inject: [NestConfigService],
      global: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
    AuthModule,
    UsersModule,
    EmailModule,
    ContactModule,
    AccountModule,
    NotificationsModule,
    StripeModule,
    CompanyModule,
  ],
  controllers: [AppController],
  providers: [AppService, EmailService],
})
export class AppModule {}
