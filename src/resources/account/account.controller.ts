import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  SetMetadata,
  Request,
  UnauthorizedException,
  Post,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { Role } from '@/types/role';
import { User } from '@/entities/User';
import { ValidationPipe } from '@/pipes/validation.pipe';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { SelectPlanDto } from './dto/select-plan.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Post('select-plan')
  async select(
    @Body(new ValidationPipe()) payload: SelectPlanDto,
    @Request() req: Express.Request & { user: User },
  ) {
    await this.accountService.selectPlan(req.user.id, payload);

    return {
      message: 'Plan selected successfully',
    };
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @ApiOperation({ summary: 'Get current user account details' })
  @Get('me')
  findMe(@Request() req: Express.Request & { user: User }) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.accountService.findOne({
      where: { email: req.user.email },
      relations: ['plan', 'installation'],
    });
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @ApiOperation({ summary: 'Update account settings' })
  @ApiBody({ type: UpdateAccountDto })
  @Patch('/me')
  async update(
    @Request() req: Express.Request & { user: User },
    @Body(new ValidationPipe()) payload: UpdateAccountDto,
  ) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.accountService.update(req.user.id, payload);
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: UpdatePasswordDto })
  @Patch('/password')
  async password(
    @Request() req: Express.Request & { user: User },
    @Body(new ValidationPipe()) payload: UpdatePasswordDto,
  ) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.accountService.updatePassword(req.user.id, payload);
  }

  @SetMetadata('roles', [Role.User])
  @Delete()
  remove(@Request() req: Express.Request & { user: User }) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.accountService.removeMe(req.user.id);
  }
}
