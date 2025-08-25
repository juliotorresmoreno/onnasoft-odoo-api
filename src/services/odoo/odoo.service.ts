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

interface CreateDatabaseResponse {
  status: 'success' | 'error';
  message?: string;
}

interface CreateVPCResponse {
  message: string;
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
    const adminUrl = config.odoo.adminUrl;

    const url = new URL(`${adminUrl}/onnasoft_admin/database/create`);
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
    }).catch((error) => {
      console.error('Error creating database:', error);
      throw error;
    });
    console.log('Response status:', response.status);

    const result = (await response.json().catch(() => ({
      message: '',
    }))) as CreateDatabaseResponse;

    if (!response.ok) {
      throw new Error(result.message || response.statusText);
    }

    return result;
  }

  async createVPC(databaseName: string, size: number) {
    const config = this.configService.get('config') as Configuration;
    const backupUrl = config.backup.url;

    const url = new URL(`${backupUrl}/configure`);
    const payload = {
      dbname: databaseName,
      size,
    };

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.log(await response.text());
      throw new Error(`Failed to create backup: ${response.statusText}`);
    }

    return (await response.json()) as CreateVPCResponse;
  }
}
