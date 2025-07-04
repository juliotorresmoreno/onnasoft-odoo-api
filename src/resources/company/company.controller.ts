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
  Request,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { buildFindManyOptions, QueryParams } from '@/types/query';
import { Company } from '@/entities/Company';
import { Role } from '@/types/role';
import { Public } from '@/utils/secure';
import { User } from '@/entities/User';
import { UsersService } from '../users/users.service';

@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly userService: UsersService,
  ) {}

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Public()
  @Get()
  async findAll(@Query() query: QueryParams<Company>) {
    const options = buildFindManyOptions(query);
    return this.companyService.findAll(options);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @SetMetadata('roles', [Role.Admin])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(id, updateCompanyDto);
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Patch('me')
  async updateMe(
    @Body() payload: UpdateCompanyDto,
    @Request() req: Express.Request & { user: User },
  ) {
    const user = await this.userService.findOne({
      where: { id: req.user.id },
      select: ['companyId'],
    });

    if (!user || !user.companyId) {
      throw new Error('Company not found for the user');
    }

    return this.companyService.update(user.companyId, payload);
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }
}
