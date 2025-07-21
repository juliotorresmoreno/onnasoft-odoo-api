import { Configuration } from '@/types/configuration';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CreateDatabaseDto {
  login: string;
  name: string;
  password: string;
  countryCode?: string;
  lang?: string;
  phone?: string;
}

@Injectable()
export class OdooService {
  constructor(private readonly configService: ConfigService) {}

  async createDatabase({
    login,
    name,
    password,
    countryCode,
    lang = 'en_US',
    phone = '',
  }: CreateDatabaseDto): Promise<any> {
    const config = this.configService.get('config') as Configuration;

    const url = new URL(`${config.odoo.adminUrl}/web/database/create`);
    const payload = {
      master_pwd: config.odoo.adminPassword,
      login: login,
      name: name,
      password: password,
      lang: lang,
      create_uid: '1',
      create_user: 'true',
      phone: phone,
    };
    if (countryCode) {
      payload['country_code'] = countryCode;
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to create database: ${response.statusText}`);
    }
  }
}
