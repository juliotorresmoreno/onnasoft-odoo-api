import { plainToInstance } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsIn,
  IsNumberString,
  IsBooleanString,
  IsUrl,
  validateSync,
  Matches,
  IsPort,
  MinLength,
} from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty({ message: 'NODE_ENV is required' })
  @IsIn(['development', 'production', 'test', 'staging'], {
    message: 'NODE_ENV must be one of: development, production, test, staging',
  })
  NODE_ENV: string;

  @IsNumberString()
  @IsPort({ message: 'PORT must be a valid port number (1-65535)' })
  PORT: string;

  @IsString()
  @IsNotEmpty({ message: 'SECRET_KEY is required' })
  @MinLength(32, {
    message: 'SECRET_KEY must be at least 32 characters long for security',
  })
  SECRET_KEY: string;

  @IsString()
  @IsNotEmpty({ message: 'BASE_URL is required' })
  @Matches(/^(https?:\/\/)?([\w.-]+)(:\d+)?(\/[\w.-]*)*\/?$/, {
    message: 'BASE_URL must be a valid URL',
  })
  BASE_URL: string;

  @IsString()
  @IsNotEmpty({ message: 'MEDIA_URL is required' })
  @Matches(/^(https?:\/\/)?([\w.-]+)(:\d+)?(\/[\w.-]*)*\/?$/, {
    message: 'MEDIA_URL must be a valid URL',
  })
  MEDIA_URL: string;

  @IsString()
  @IsNotEmpty({ message: 'RESEND_API_KEY is required' })
  @MinLength(32, {
    message: 'RESEND_API_KEY must be at least 32 characters long',
  })
  RESEND_API_KEY: string;

  @IsString()
  @IsNotEmpty({ message: 'FROM_EMAIL is required' })
  FROM_EMAIL: string;

  @IsString()
  @IsNotEmpty({ message: 'CONTACT_EMAIL is required' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'CONTACT_EMAIL must be a valid email address',
  })
  CONTACT_EMAIL: string;

  @IsString()
  @IsNotEmpty({ message: 'EMAIL_STRATEGY is required' })
  @IsIn(['console', 'resend'], {
    message: 'EMAIL_STRATEGY must be either console or resend',
  })
  EMAIL_STRATEGY: string;

  // Database Configuration
  @IsString()
  @IsNotEmpty({ message: 'DB_DRIVER is required' })
  @IsIn(['postgres', 'mysql', 'sqlite', 'mariadb', 'cockroachdb'], {
    message: 'DB_DRIVER must be a supported database driver',
  })
  DB_DRIVER: string;

  @IsString()
  @IsNotEmpty({ message: 'DB_HOST is required' })
  @Matches(
    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/,
    {
      message: 'DB_HOST must be a valid hostname or IP address',
    },
  )
  DB_HOST: string;

  @IsNumberString()
  @IsPort({ message: 'DB_PORT must be a valid port number (1-65535)' })
  DB_PORT: string;

  @IsString()
  @IsNotEmpty({ message: 'DB_USERNAME is required' })
  DB_USERNAME: string;

  @IsString()
  @IsNotEmpty({ message: 'DB_PASSWORD is required' })
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty({ message: 'DB_DATABASE is required' })
  DB_DATABASE: string;

  @IsBooleanString()
  @IsNotEmpty({ message: 'DB_SYNCHRONIZE is required (true/false)' })
  DB_SYNCHRONIZE: string;

  @IsBooleanString()
  @IsNotEmpty({ message: 'DB_LOGGING is required (true/false)' })
  DB_LOGGING: string;

  @IsBooleanString()
  @IsNotEmpty({ message: 'DB_SSL is required (true/false)' })
  DB_SSL: string;

  @IsString()
  @IsIn(['require', 'verify-full', 'prefer', 'allow', 'disable'], {
    message:
      'DB_EXTRA_SSL must be one of: require, verify-full, prefer, allow, disable',
  })
  DB_EXTRA_SSL: string;

  @IsNumberString()
  @Matches(/^[1-9]\d*$/, {
    message: 'DB_POOL_MAX must be a positive integer',
  })
  DB_POOL_MAX: string;

  @IsNumberString()
  @Matches(/^[1-9]\d*$/, {
    message: 'DB_POOL_MIN must be a positive integer',
  })
  DB_POOL_MIN: string;

  // Redis Configuration
  @IsUrl({
    protocols: ['redis'],
    require_tld: false,
    allow_underscores: true,
  })
  @IsNotEmpty({ message: 'REDIS_URL is required (redis://host:port)' })
  REDIS_URL: string;

  @IsString()
  @IsNotEmpty({ message: 'STRIPE_SECRET_KEY is required' })
  @MinLength(32, {
    message: 'STRIPE_SECRET_KEY must be at least 32 characters long',
  })
  STRIPE_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty({ message: 'STRIPE_WEBHOOK_SECRET is required' })
  @MinLength(32, {
    message: 'STRIPE_WEBHOOK_SECRET must be at least 32 characters long',
  })
  STRIPE_WEBHOOK_SECRET: string;

  @IsString()
  @IsNotEmpty({ message: 'WEBSITE_URL is required' })
  @Matches(/^(https?:\/\/)?([\w.-]+)(:\d+)?(\/[\w.-]*)*\/?$/, {
    message: 'WEBSITE_URL must be a valid URL',
  })
  WEBSITE_URL: string;

  @IsString()
  @IsNotEmpty({ message: 'PRIVACY_URL is required' })
  @Matches(/^(https?:\/\/)?([\w.-]+)(:\d+)?(\/[\w.-]*)*\/?$/, {
    message: 'PRIVACY_URL must be a valid URL',
  })
  PRIVACY_URL: string;

  @IsString()
  @IsNotEmpty({ message: 'TERMS_URL is required' })
  @Matches(/^(https?:\/\/)?([\w.-]+)(:\d+)?(\/[\w.-]*)*\/?$/, {
    message: 'TERMS_URL must be a valid URL',
  })
  TERMS_URL: string;

  @IsString()
  @IsNotEmpty({ message: 'SUPPORT_EMAIL is required' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'SUPPORT_EMAIL must be a valid email address',
  })
  SUPPORT_EMAIL: string;

  @IsString()
  @IsNotEmpty({ message: 'SUPPORT_PHONE is required' })
  SUPPORT_PHONE: string;

  @IsString()
  @IsNotEmpty({ message: 'SUPPORT_CONTACT is required' })
  @Matches(/^[a-zA-Z0-9\s,.'-]+$/, {
    message: 'SUPPORT_CONTACT must be a valid contact name',
  })
  SUPPORT_CONTACT: string;

  @IsString()
  @IsNotEmpty({ message: 'SUPPORT_ADDRESS is required' })
  @Matches(/^[a-zA-Z0-9\s,.'-]+$/, {
    message: 'SUPPORT_ADDRESS must be a valid address',
  })
  SUPPORT_ADDRESS: string;

  // MinIO Configuration
  @IsString()
  @IsNotEmpty({ message: 'MINIO_USER is required' })
  MINIO_USER: string;

  @IsString()
  @IsNotEmpty({ message: 'MINIO_PASSWORD is required' })
  @MinLength(8, {
    message: 'MINIO_PASSWORD must be at least 8 characters long',
  })
  MINIO_PASSWORD: string;

  @IsString()
  @IsNotEmpty({ message: 'MINIO_ENDPOINT is required' })
  @Matches(
    /^(([a-zA-Z0-9]|[a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/,
    {
      message: 'MINIO_ENDPOINT must be a valid hostname or IP address',
    },
  )
  MINIO_ENDPOINT: string;

  @IsNumberString()
  @IsPort({ message: 'MINIO_PORT must be a valid port number (1-65535)' })
  MINIO_PORT: string;

  @IsString()
  @IsNotEmpty({ message: 'MINIO_BUCKET is required' })
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message:
      'MINIO_BUCKET must be a valid bucket name (alphanumeric, dashes, and underscores only)',
  })
  MINIO_BUCKET: string;

  @IsBooleanString()
  @IsNotEmpty({ message: 'MINIO_USE_SSL is required (true/false)' })
  MINIO_USE_SSL: string;

  // Plans Configuration
  @IsString()
  @IsNotEmpty({ message: 'PLAN_STARTER_ID is required' })
  PLAN_STARTER_ID: string;

  @IsString()
  @IsNotEmpty({ message: 'PLAN_STARTER_NAME is required' })
  PLAN_STARTER_NAME: string;

  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})$/, {
    message:
      'PLAN_STARTER_PRICE must be a valid number with up to 2 decimal places',
  })
  PLAN_STARTER_PRICE: string;

  @IsIn(['month', 'year'], {
    message: 'PLAN_STARTER_INTERVAL must be either month or year',
  })
  PLAN_STARTER_INTERVAL: string;

  @IsString()
  @IsNotEmpty({ message: 'PLAN_BUSINESS_ID is required' })
  PLAN_BUSINESS_ID: string;

  @IsString()
  @IsNotEmpty({ message: 'PLAN_BUSINESS_NAME is required' })
  PLAN_BUSINESS_NAME: string;

  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})$/, {
    message:
      'PLAN_BUSINESS_PRICE must be a valid number with up to 2 decimal places',
  })
  PLAN_BUSINESS_PRICE: string;

  @IsIn(['month', 'year'], {
    message: 'PLAN_BUSINESS_INTERVAL must be either month or year',
  })
  PLAN_BUSINESS_INTERVAL: string;

  @IsString()
  @IsNotEmpty({ message: 'PLAN_ENTERPRISE_ID is required' })
  PLAN_ENTERPRISE_ID: string;

  @IsString()
  @IsNotEmpty({ message: 'PLAN_ENTERPRISE_NAME is required' })
  PLAN_ENTERPRISE_NAME: string;

  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})$/, {
    message:
      'PLAN_ENTERPRISE_PRICE must be a valid number with up to 2 decimal places',
  })
  PLAN_ENTERPRISE_PRICE: string;

  @IsIn(['month', 'year'], {
    message: 'PLAN_ENTERPRISE_INTERVAL must be either month or year',
  })
  PLAN_ENTERPRISE_INTERVAL: string;

  @IsString()
  @IsNotEmpty({ message: 'PLAN_STARTER_ANUAL_ID is required' })
  PLAN_STARTER_ANUAL_ID: string;

  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})$/, {
    message:
      'PLAN_STARTER_ANUAL_PRICE must be a valid number with up to 2 decimal places',
  })
  PLAN_STARTER_ANUAL_PRICE: string;

  @IsString()
  @IsNotEmpty({ message: 'PLAN_BUSINESS_ANUAL_ID is required' })
  PLAN_BUSINESS_ANUAL_ID: string;

  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})$/, {
    message:
      'PLAN_BUSINESS_ANUAL_PRICE must be a valid number with up to 2 decimal places',
  })
  PLAN_BUSINESS_ANUAL_PRICE: string;

  @IsString()
  @IsNotEmpty({ message: 'PLAN_ENTERPRISE_ANUAL_ID is required' })
  PLAN_ENTERPRISE_ANUAL_ID: string;

  @IsNumberString()
  @Matches(/^\d+(\.\d{1,2})$/, {
    message:
      'PLAN_ENTERPRISE_ANUAL_PRICE must be a valid number with up to 2 decimal places',
  })
  PLAN_ENTERPRISE_ANUAL_PRICE: string;

  @IsString()
  @IsNotEmpty({ message: 'STRIPE_PRODUCT_ID is required' })
  STRIPE_PRODUCT_ID: string;

  // Odoo Configuration
  @IsString()
  @IsNotEmpty({ message: 'ODOO_ADMIN_URL is required' })
  @Matches(/^(http(s)?:\/\/)?([\w.-]+)(:\d+)?(\/[\w.-]*)*\/?$/, {
    message: 'ODOO_ADMIN_URL must be a valid URL',
  })
  ODOO_ADMIN_URL: string;

  @IsString()
  @IsNotEmpty({ message: 'ODOO_ADMIN_USER is required' })
  ODOO_ADMIN_USER: string;

  @IsString()
  @IsNotEmpty({ message: 'ODOO_ADMIN_PASSWORD is required' })
  @MinLength(8, {
    message: 'ODOO_ADMIN_PASSWORD must be at least 8 characters long',
  })
  ODOO_ADMIN_PASSWORD: string;

  @IsString()
  @IsNotEmpty({ message: 'ODOO_BACKUP_URL is required' })
  @Matches(/^(http(s)?:\/\/)?([\w.-]+)(:\d+)?(\/[\w.-]*)*\/?$/, {
    message: 'ODOO_BACKUP_URL must be a valid URL',
  })
  ODOO_BACKUP_URL: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
    whitelist: true,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => {
        const constraints = Object.values(error.constraints || {});
        return `${error.property}: ${constraints.join(', ')}`;
      })
      .join('\n');

    throw new Error(`Environment validation failed:\n${errorMessages}`);
  }

  return validatedConfig;
}
