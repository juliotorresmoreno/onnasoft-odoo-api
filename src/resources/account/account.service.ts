import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UsersService } from '../users/users.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { comparePassword, hashPassword } from '@/utils/secure';
import { NotificationsService } from '../notifications/notifications.service';
import { Notification } from '@/entities/Notification';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { User } from '@/entities/User';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '@/types/configuration';

@Injectable()
export class AccountService {
  private readonly defaultLimit;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {
    this.defaultLimit =
      this.configService.get<Configuration>('config')?.defaultLimit ?? 10;
  }

  findOne(params: string): Promise<User | null>;
  findOne(params: FindOneOptions<User>): Promise<User | null>;
  findOne(params: string | FindOneOptions<User>): Promise<User | null> {
    if (typeof params === 'string') {
      return this.usersService.findOne({
        select: [
          'id',
          'email',
          'firstName',
          'lastName',
          'language',
          'timezone',
          'newsletter',
          'createdAt',
          'updatedAt',
        ],
        where: { id: params },
      });
    }
    return this.usersService.findOne(params);
  }

  async findAll(options?: FindManyOptions<User>) {
    const buildOptions: typeof options = { ...options };
    if (buildOptions) {
      if (!buildOptions.take) buildOptions.take = this.defaultLimit;
      if (!buildOptions.order) buildOptions.order = { createdAt: 'DESC' };
    }

    return this.usersService.findAll(buildOptions);
  }

  async update(id: string, payload: UpdateAccountDto) {
    const result = await this.usersService
      .update(id, payload)
      .catch((error) => {
        throw new InternalServerErrorException(
          'Failed to update account',
          error.message,
        );
      });

    await this.notificationsService
      .create(
        new Notification({
          title: 'Account Updated',
          userId: id,
          metadata: {
            type: 'account_update',
            message: 'Your account details have been successfully updated.',
          },
        }),
      )
      .catch((error) => {
        throw new InternalServerErrorException(
          'Failed to create notification for account update',
          error.message,
        );
      });

    return result;
  }

  async updatePassword(id: string, payload: UpdatePasswordDto) {
    const hashedPassword = await hashPassword(payload.newPassword);

    const user = await this.usersService
      .findOne({
        select: ['id', 'password'],
        where: { id },
      })
      .catch((error) => {
        throw new InternalServerErrorException(
          'Failed to retrieve user for password update',
          error.message,
        );
      });
    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    const isPasswordValid = await comparePassword(
      payload.currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const result = await this.usersService
      .update(user.id, {
        password: hashedPassword,
      })
      .catch((error) => {
        throw new InternalServerErrorException(
          'Failed to update password',
          error.message,
        );
      });

    await this.notificationsService
      .create(
        new Notification({
          title: 'Password Updated',
          userId: user.id,
          metadata: {
            type: 'password_update',
            message: 'Your password has been successfully updated.',
          },
        }),
      )
      .catch((error) => {
        throw new InternalServerErrorException(
          'Failed to create notification for password update',
          error.message,
        );
      });

    return result;
  }

  removeMe(id: string) {
    return this.usersService.remove(id).catch((error) => {
      throw new InternalServerErrorException(
        'Failed to delete account',
        error.message,
      );
    });
  }
}
