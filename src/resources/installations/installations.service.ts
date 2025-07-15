import { BadRequestException, Injectable } from '@nestjs/common';
import { Installation } from '@/entities/Installation';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { pagination } from '@/utils/pagination';
import { CreateInstallationDto } from './dto/create-installation.dto';
import { UpdateInstallationDto } from './dto/update-installation.dto';
import { UsersService } from '@/resources/users/users.service';
import { OdooService } from '@/services/odoo/odoo.service';
import { Configuration } from '@/types/configuration';
import { BackupGroup } from '@/types/models';

@Injectable()
export class InstallationsService {
  private readonly defaultLimit: number;
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Installation)
    private readonly installationRepository: Repository<Installation>,
    private readonly usersService: UsersService,
    private readonly odooService: OdooService,
  ) {
    const config = this.configService.get('config');
    this.defaultLimit = config?.defaultLimit || 10;
  }

  async create(payload: CreateInstallationDto & { userId: string }) {
    const user = await this.usersService.findOne({
      where: { id: payload.userId },
      select: [
        'id',
        'phone',
        'email',
        'language',
        'stripeCustomerId',
        'stripeSubscriptionId',
      ],
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
      .then(async (installation) => {
        try {
          if (payload.edition === 'community') {
            console.log({
              name: payload.database,
              password: payload.password,
              lang: `${user.language}_US`,
              phone: user.phone ?? '',
            });

            await this.odooService.createDatabase({
              login: user.email,
              name: payload.database,
              password: payload.password,
              lang: `${user.language}_US`,
              phone: user.phone ?? '',
            });

            await this.installationRepository.update(installation.id, {
              status: 'active',
            });
          }

          return installation;
        } catch {
          await this.installationRepository.delete(installation.id);
          throw new BadRequestException(
            'Failed to create Odoo database. Please check your configuration.',
          );
        }
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

  async findBackupsByUserId(userId: string) {
    const config = this.configService.get('config') as Configuration;
    const installations = await this.usersService
      .findAll({
        where: { id: userId },
        select: ['id', 'installation', 'createdAt'],
        relations: ['installation'],
      })
      .then(({ data: users }) => users.map((user) => user.installation));

    if (!installations || installations.length === 0) {
      throw new BadRequestException('No installations found for this user.');
    }

    const response = await fetch(
      `${config.backup.url}/backup/${installations[0].database}`,
    );
    const backups = (await response.json()) as BackupGroup;

    return backups.files;
  }

  async downloadBackupByUserId(userId: string, backupId: string) {
    const config = this.configService.get('config') as Configuration;
    const installations = await this.usersService
      .findAll({
        where: { id: userId },
        select: ['id', 'installation', 'createdAt'],
        relations: ['installation'],
      })
      .then(({ data: users }) => users.map((user) => user.installation));
    if (!installations || installations.length === 0) {
      throw new BadRequestException('No installations found for this user.');
    }

    const installation = installations[0];
    const response = await fetch(
      `${config.backup.url}/download/${installation.database}/${backupId}`,
    );

    if (!response.ok) {
      throw new BadRequestException('Failed to download backup');
    }

    return response.arrayBuffer();
  }

  update(id: number, payload: UpdateInstallationDto) {
    return this.installationRepository.update(id, payload);
  }

  remove(id: string) {
    return this.installationRepository.delete(id);
  }
}
