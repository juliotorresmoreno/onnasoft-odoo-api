import { Module } from '@nestjs/common';
import { OdooService } from './odoo.service';

@Module({
  controllers: [],
  providers: [OdooService],
  exports: [OdooService],
})
export class OdooModule {}
