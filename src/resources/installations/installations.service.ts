import { BadRequestException, Injectable } from '@nestjs/common';
import { Installation } from '@/entities/Installation';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { pagination } from '@/utils/pagination';
import { CreateInstallationDto } from './dto/create-installation.dto';
import { UpdateInstallationDto } from './dto/update-installation.dto';
import { UsersService } from '@/resources/users/users.service';

@Injectable()
export class InstallationsService {
  private readonly defaultLimit: number;
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Installation)
    private readonly installationRepository: Repository<Installation>,
    private readonly usersService: UsersService,
  ) {
    const config = this.configService.get('config');
    this.defaultLimit = config?.defaultLimit || 10;
  }

  async create(payload: CreateInstallationDto & { userId: string }) {
    const user = await this.usersService.findOne({
      where: { id: payload.userId },
      select: ['id', 'stripeCustomerId', 'stripeSubscriptionId'],
    });

    if (!user) {
      throw new BadRequestException(
        'User not found. Please provide a valid user ID.',
      );
    }

    if (!user.stripeCustomerId || !user.stripeSubscriptionId) {
      throw new BadRequestException(
        'User is not subscribed to any plan. Please provide a valid user ID.',
      );
    }

    const existingDomain = await this.installationRepository.findOne({
      where: { domain: payload.database },
    });
    if (existingDomain) {
      throw new BadRequestException(
        'An installation already exists for this domain. Please use a different database name.',
      );
    }

    const existingInstallation = await this.installationRepository.findOne({
      where: { userId: payload.userId },
    });

    if (existingInstallation) {
      throw new BadRequestException(
        'An installation already exists for this user. Please remove the existing installation before creating a new one.',
      );
    }

    return this.installationRepository
      .save({
        ...payload,
        domain: payload.database,
        status: 'pending',
        userId: payload.userId,
        stripeCustomerId: user.stripeCustomerId,
        subscriptionId: user.stripeSubscriptionId,
      })
      .catch(() => {
        throw new BadRequestException('Error creating installation');
      });
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
