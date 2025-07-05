import { Injectable } from '@nestjs/common';
import { Company } from '@/entities/Company';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Configuration } from '@/types/configuration';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { pagination } from '@/utils/pagination';
import { MediaService } from '../media/media.service';
import { generateRandomToken } from '@/utils/secure';
import * as sharp from 'sharp';

@Injectable()
export class CompanyService {
  private readonly defaultLimit: number;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly mediaService: MediaService,
  ) {
    this.defaultLimit =
      this.configService.get<Configuration>('config')?.defaultLimit ?? 10;
  }

  create(payload: CreateCompanyDto) {
    return this.companyRepository.save(payload);
  }

  async findAll(options?: FindManyOptions<Company>) {
    const buildOptions: typeof options = { ...options };
    if (options) {
      if (!options.take) options.take = this.defaultLimit;
      if (!options.order) options.order = { createdAt: 'DESC' };
    }
    const [data, count] = await this.companyRepository.findAndCount(options);

    return pagination({
      data,
      count,
      take: buildOptions.take || this.defaultLimit,
      skip: buildOptions.skip || 0,
    });
  }

  findOne(id: string) {
    return this.companyRepository.findOne({
      where: { id },
    });
  }

  async update(id: string, payload: UpdateCompanyDto) {
    const logoUrl = payload.logoUrl;
    if (logoUrl && logoUrl.startsWith('data:')) {
      const base64Data = logoUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const webpBuffer = await sharp(buffer)
        .resize({ width: 300 })
        .toFormat('webp')
        .toBuffer();
      const fileName = await this.mediaService.uploadFile(
        webpBuffer,
        generateRandomToken() + '.webp',
      );
      payload.logoUrl = await this.mediaService.getFileUrl(fileName);
    }

    await this.companyRepository.update(id, payload);

    return this.companyRepository.findOne({
      where: { id },
    });
  }

  remove(id: string) {
    return this.companyRepository.delete(id).then(() => ({
      deleted: true,
    }));
  }
}
