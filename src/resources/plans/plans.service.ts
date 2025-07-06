import { Injectable } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Plan } from '@/entities/Plan';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { pagination } from '@/utils/pagination';

@Injectable()
export class PlansService {
  private readonly defaultLimit = 10;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Plan)
    private readonly userRepository: Repository<Plan>,
  ) {}

  create(payload: CreatePlanDto) {
    return this.userRepository.save(payload);
  }

  async findAll(options?: FindManyOptions<Plan>) {
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

  findOne(options: FindOneOptions<Plan>) {
    return this.userRepository.findOne(options);
  }

  async update(id: string, payload: UpdatePlanDto) {
    await this.userRepository.update(id, payload);
    return this.findOne({ where: { id } });
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }
}
