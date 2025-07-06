import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  SetMetadata,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Public } from '@/utils/secure';
import { buildFindManyOptions, QueryParams } from '@/utils/query';
import { Plan } from '@/entities/Plan';
import { Role } from '@/types/role';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Public()
  @Get()
  async findAll(@Query() query: QueryParams<Plan>) {
    const options = buildFindManyOptions(query);
    return this.plansService.findAll(options);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne({ where: { id } });
  }

  @SetMetadata('roles', [Role.Admin])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(id, updatePlanDto);
  }

  @SetMetadata('roles', [Role.Admin])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plansService.remove(+id);
  }
}
