import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/entities/User';
import { FindOneOptions, Repository, FindManyOptions } from 'typeorm';
import { Role } from '@/types/role';
import { CompanyService } from '../company/company.service';
import { ConfigService } from '@nestjs/config';
import { pagination } from '@/utils/pagination';

type CreateUserPayload = CreateUserDto & {
  role?: Role;
  isEmailVerified?: boolean;
};

@Injectable()
export class UsersService {
  private readonly defaultLimit = 10;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly companyService: CompanyService,
  ) {}

  async create(payload: CreateUserPayload) {
    const { companyName, companySize, industry, position, ...userData } =
      payload;

    const company = await this.companyService.create({
      name: companyName,
      size: companySize,
      industry: industry,
      position,
    });

    const user = this.userRepository.create({
      ...userData,
      companyId: company.id,
      company,
      isEmailVerified: payload.isEmailVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.userRepository.save(user);
  }

  async findAll(options?: FindManyOptions<User>) {
    const buildOptions: typeof options = { ...options };
    if (buildOptions) {
      if (!buildOptions.take) buildOptions.take = this.defaultLimit;
      if (!buildOptions.order) buildOptions.order = { createdAt: 'DESC' };
    }
    const [data, count] = await this.userRepository.findAndCount(buildOptions);

    return pagination({
      data,
      count,
      take: buildOptions.take || this.defaultLimit,
      skip: buildOptions.skip || 0,
    });
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
