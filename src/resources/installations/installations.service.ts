import { Injectable } from '@nestjs/common';
import { CreateInstallationDto } from './dto/create-installation.dto';
import { UpdateInstallationDto } from './dto/update-installation.dto';
import { Installation } from '@/entities/Installation';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { pagination } from '@/utils/pagination';

@Injectable()
export class InstallationsService {
  private readonly defaultLimit: number;
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Installation)
    private readonly installationRepository: Repository<Installation>,
  ) {
    const config = this.configService.get('config');
    this.defaultLimit = config?.defaultLimit || 10;
  }

  create(payload: CreateInstallationDto) {
    const installation = this.installationRepository.create(payload);
    return this.installationRepository.save(installation);
  }

  async findAll(options?: FindManyOptions<Installation>) {
    const buildOptions: typeof options = { ...options };
    if (options) {
      if (!options.take) options.take = this.defaultLimit;
      if (!options.order) options.order = { createdAt: 'DESC' };
    }
    const [data, count] =
      await this.installationRepository.findAndCount(options);

    return pagination({
      data,
      count,
      take: buildOptions.take || this.defaultLimit,
      skip: buildOptions.skip || 0,
    });
  }

  findOne(params: string): Promise<Installation | null>;
  findOne(params: FindOneOptions<Installation>): Promise<Installation | null>;
  findOne(
    params: string | FindOneOptions<Installation>,
  ): Promise<Installation | null> {
    if (typeof params === 'string') {
      return this.installationRepository.findOne({
        where: { id: params },
      });
    }
    return this.installationRepository.findOne(params);
  }

  update(id: number, payload: UpdateInstallationDto) {
    return this.installationRepository.update(id, payload);
  }

  remove(id: string) {
    return this.installationRepository.delete(id);
  }
}
