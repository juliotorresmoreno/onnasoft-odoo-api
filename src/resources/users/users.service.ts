import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/entities/User';
import { FindOneOptions, Repository, IsNull, FindManyOptions } from 'typeorm';
import { Role } from '@/types/role';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(payload: CreateUserDto & { isEmailVerified?: boolean; role: Role }) {
    return this.userRepository.save({
      ...payload,
      isEmailVerified: payload.isEmailVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  findAll(options?: FindManyOptions<User>) {
    let buildOptions: FindManyOptions<User> | undefined = {
      where: { deletedAt: IsNull() },
      select: ['id', 'firstName', 'lastName', 'email'],
      order: { createdAt: 'DESC' },
      take: 100,
    };
    if (options) {
      buildOptions = {
        ...buildOptions,
        ...options,
        where: { ...options.where, deletedAt: IsNull() },
      };
    }
    return this.userRepository.find(buildOptions);
  }

  findOne(options: FindOneOptions<User>) {
    return this.userRepository.findOne(options);
  }

  async update(id: string, payload: Partial<User>) {
    await this.userRepository.update(id, payload);
    return this.findOne({ where: { id } });
  }

  async remove(id: string) {
    await this.userRepository.delete(id);
    return { deleted: true };
  }
}
