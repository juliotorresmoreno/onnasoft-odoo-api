import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  SetMetadata,
  Request,
  UnauthorizedException,
  ValidationPipe,
  Res,
} from '@nestjs/common';
import { InstallationsService } from './installations.service';
import { CreateInstallationDto } from './dto/create-installation.dto';
import { UpdateInstallationDto } from './dto/update-installation.dto';
import { Role } from '@/types/role';
import { ApiOperation } from '@nestjs/swagger';
import { User } from '@/entities/User';
import Express from 'express';

@Controller('installations')
export class InstallationsController {
  constructor(private readonly installationsService: InstallationsService) {}

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Post()
  async create(
    @Request() req: Express.Request & { user: User },
    @Body(new ValidationPipe()) payload: CreateInstallationDto,
  ) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.installationsService.create({
      ...payload,
      userId: req.user.id,
    });
  }

  @SetMetadata('roles', [Role.Admin])
  @Get()
  findAll() {
    return this.installationsService.findAll();
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @ApiOperation({ summary: 'Get current user account details' })
  @Get('me')
  findMe(@Request() req: Express.Request & { user: User }) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.installationsService.findOne({
      where: { userId: req.user.id },
    });
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @ApiOperation({ summary: 'Get current user backups' })
  @Get('me/backups')
  backups(@Request() req: Express.Request & { user: User }) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Assuming you have a method to get backups for a user
    return this.installationsService.findBackupsByUserId(req.user.id);
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @ApiOperation({ summary: 'Download a specific backup for the current user' })
  @Get('me/backups/download/:backupId')
  async downloadBackup(
    @Res() res: Express.Response,
    @Request() req: Express.Request & { user: User },
    @Param('backupId') backupId: string,
  ) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    const buffer = await this.installationsService.downloadBackupByUserId(
      req.user.id,
      backupId,
    );

    if (!buffer) {
      throw new UnauthorizedException('Backup not found or access denied');
    }

    res.setHeader('Content-Disposition', `attachment; filename=${backupId}`);
    res.setHeader('Content-Type', 'application/zip');
    res.send(Buffer.from(buffer));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInstallationDto: UpdateInstallationDto,
  ) {
    return this.installationsService.update(+id, updateInstallationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.installationsService.remove(id);
  }
}
