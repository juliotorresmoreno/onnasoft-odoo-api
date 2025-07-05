import { forwardRef, Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '@/entities/Company';
import { UsersModule } from '../users/users.module';
import { MediaModule } from '../media/media.module';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
  imports: [
    TypeOrmModule.forFeature([Company]),
    forwardRef(() => UsersModule),
    MediaModule,
  ],
})
export class CompanyModule {}
