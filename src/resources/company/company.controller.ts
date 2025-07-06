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
  NotFoundException,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { buildFindManyOptions, QueryParams } from '@/utils/query';
import { Company } from '@/entities/Company';
import { Role } from '@/types/role';
import { IS_PUBLIC_KEY, Public } from '@/utils/secure';
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

  @SetMetadata('roles', [Role.User, Role.Admin, IS_PUBLIC_KEY])
  @Get(':id')
  async findOne(
    @Request() req: Express.Request & { user: User },
    @Param('id') id: string,
  ) {
    if (id === 'me') {
      if (!req.user || !req.user.email) {
        throw new NotFoundException('User not found');
      }

      const user = await this.userService.findOne({
        where: { email: req.user.email },
        select: ['companyId'],
      });

      if (!user || !user.companyId) {
        throw new NotFoundException('Company not found for the user');
      }

      return this.companyService.findOne(user.companyId);
    }

    return this.companyService.findOne(id);
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Patch(':id')
  async update(
    @Request() req: Express.Request & { user: User },
    @Body() payload: UpdateCompanyDto,
    @Param('id') id: string,
  ) {
    if (id === 'me') {
      const user = await this.userService.findOne({
        where: { email: req.user.email },
        select: ['companyId'],
      });

      if (!user?.companyId) {
        throw new NotFoundException('Company not found for the user');
      }

      return this.companyService.update(user.companyId, payload);
    }

    if (req.user.role !== Role.Admin) {
      throw new NotFoundException(
        'You do not have permission to update this company',
      );
    }

    return this.companyService.update(id, payload);
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
      throw new NotFoundException('Company not found for the user');
    }

    return this.companyService.update(user.companyId, payload);
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }
}
