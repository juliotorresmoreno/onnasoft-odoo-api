import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  SetMetadata,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@/types/role';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from '@/entities/User';
import { buildFindManyOptions, QueryParams } from '@/utils/query';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @SetMetadata('roles', [Role.Admin])
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created', type: User })
  create(@Body() payload: CreateUserDto) {
    return this.usersService.create({
      ...payload,
      isEmailVerified: true,
      role: Role.User,
    });
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [User] })
  @Get()
  async findAll(@Query() query: QueryParams<User>) {
    const options = buildFindManyOptions(query);
    return this.usersService.findAll(options);
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({ where: { id } });
  }

  @SetMetadata('roles', [Role.Admin])
  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated', type: User })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @SetMetadata('roles', [Role.Admin])
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
