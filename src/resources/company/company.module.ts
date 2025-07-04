import { forwardRef, Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '@/entities/Company';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
  imports: [TypeOrmModule.forFeature([Company]), forwardRef(() => UsersModule)],
})
export class CompanyModule {}
