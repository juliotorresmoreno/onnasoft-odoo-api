import { Module } from '@nestjs/common';
import { InstallationsService } from './installations.service';
import { InstallationsController } from './installations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Installation } from '@/entities/Installation';
import { UsersModule } from '../users/users.module';
import { OdooModule } from '@/services/odoo/odoo.module';

@Module({
  controllers: [InstallationsController],
  providers: [InstallationsService],
  imports: [TypeOrmModule.forFeature([Installation]), UsersModule, OdooModule],
})
export class InstallationsModule {}
