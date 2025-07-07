import { Injectable } from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Plan } from '@/entities/Plan';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { pagination } from '@/utils/pagination';
import { Configuration } from '@/types/configuration';

@Injectable()
export class PlansService {
  private readonly defaultLimit;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {
    const config = this.configService.get('config') as Configuration;

    this.defaultLimit = config.defaultLimit || 10;
  }

  create(payload: CreatePlanDto) {
    return this.planRepository.save(payload);
  }

  async findAll(options?: FindManyOptions<Plan>) {
    const buildOptions: typeof options = { ...options };
    if (buildOptions) {
      if (!buildOptions.take) buildOptions.take = this.defaultLimit;
      if (!buildOptions.order) buildOptions.order = { createdAt: 'DESC' };
    }
    const [data, count] = await this.planRepository.findAndCount(buildOptions);

    return pagination({
      data,
      count,
      take: buildOptions.take || this.defaultLimit,
      skip: buildOptions.skip || 0,
    });
  }

  findOne(options: FindOneOptions<Plan>) {
    return this.planRepository.findOne(options);
  }

  async update(id: string, payload: UpdatePlanDto) {
    await this.planRepository.update(id, payload);
    return this.findOne({ where: { id } });
  }

  remove(id: number) {
    return this.planRepository.delete(id);
  }
}
