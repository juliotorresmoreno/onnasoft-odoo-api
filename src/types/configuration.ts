import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface RedisConfiguration {
  url: string;
}

export interface Configuration {
  env: 'development' | 'production';
  port: number;
  secret: string;
  database: TypeOrmModuleOptions;
  redis: RedisConfiguration;
  baseUrl: string;
  mediaUrl: string;
  defaultLimit: number;
  websiteUrl: string;
  privacyUrl: string;
  termsUrl: string;
  supportEmail: string;
  supportPhone: string;
  supportContact: string;
  supportAddress: string;
  email: {
    strategy: 'console' | 'resend';
    resendApiKey?: string;
    fromEmail?: string;
    contact?: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
    productId: string;
  };

  minio: {
    user: string;
    password: string;
    endpoint: string;
    port: number;
    bucket: string;
    useSSL: boolean;
  };

  plans: {
    starter: {
      id: string;
      anualId: string;
      name: string;
      price: number;
      anualPrice: number;
      interval: 'month' | 'year';
    };
    business: {
      id: string;
      anualId: string;
      name: string;
      price: number;
      anualPrice?: number;
      interval: 'month' | 'year';
    };
    enterprise: {
      id: string;
      anualId: string;
      name: string;
      price: number;
      anualPrice?: number;
      interval: 'month' | 'year';
    };
  };

  odoo: {
    adminUrl: string;
    adminUser: string;
    adminPassword: string;
  };

  backup: {
    url: string;
  };
}
