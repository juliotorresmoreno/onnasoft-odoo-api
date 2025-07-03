// src/services/email/email.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { createEmailStrategy } from './email-strategy.factory';
import { EmailStrategy } from './strategies/email-strategy.interface';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '@/types/configuration';
import Handlebars from 'handlebars';
import * as fs from 'fs';
import { Language } from '@/utils/language';

interface Templates {
  verification: Handlebars.TemplateDelegate;
  passwordReset: Handlebars.TemplateDelegate;
  welcome: Handlebars.TemplateDelegate;
}

interface SendVerificationEmailParams {
  to: string;
  name: string;
  token: string;
  language: Language;
}

interface SendPasswordResetEmailParams {
  to: string;
  token: string;
  language: Language;
}

interface SendWelcomeEmailParams {
  to: string;
  language: Language;
}

@Injectable()
export class EmailService {
  private readonly strategy: EmailStrategy;
  private readonly templates: {
    [K in Language]: Templates;
  };

  constructor(@Inject() private readonly configService: ConfigService) {
    const config = this.configService.get('config') as Configuration;
    this.strategy = createEmailStrategy(config.email.strategy, {
      resendApiKey: config.email.resendApiKey,
      fromEmail: config.email.fromEmail,
    });

    const templates = {
      en: {
        verification: fs.readFileSync(
          'src/services/email/templates/verification.en.html',
          'utf-8',
        ),
        passwordReset: fs.readFileSync(
          'src/services/email/templates/password-reset.en.html',
          'utf-8',
        ),
        welcome: fs.readFileSync(
          'src/services/email/templates/welcome.en.html',
          'utf-8',
        ),
      },
      es: {
        verification: fs.readFileSync(
          'src/services/email/templates/verification.es.html',
          'utf-8',
        ),
        passwordReset: fs.readFileSync(
          'src/services/email/templates/password-reset.es.html',
          'utf-8',
        ),
        welcome: fs.readFileSync(
          'src/services/email/templates/welcome.es.html',
          'utf-8',
        ),
      },
    };
    this.templates = {
      en: {
        verification: Handlebars.compile(templates.en.verification),
        passwordReset: Handlebars.compile(templates.en.passwordReset),
        welcome: Handlebars.compile(templates.en.welcome),
      },
      es: {
        verification: Handlebars.compile(templates.es.verification),
        passwordReset: Handlebars.compile(templates.es.passwordReset),
        welcome: Handlebars.compile(templates.es.welcome),
      },
    };
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    await this.strategy.send(to, subject, html);
  }

  async sendVerificationEmail({
    to,
    name,
    token,
    language,
  }: SendVerificationEmailParams): Promise<void> {
    const config = this.configService.get('config') as Configuration;
    const url = `${config.baseUrl}/verify-email?token=${token}`;
    const template = this.templates[language].verification;
    const html = template({
      verification_url: url,
      user_name: name,
      currentYear: new Date().getFullYear(),
      website_url: config.websiteUrl,
      privacy_url: config.privacyUrl,
      terms_url: config.termsUrl,
    });

    await this.strategy.send(to, 'Verify your account', html);
  }

  async sendPasswordResetEmail({
    to,
    token,
    language,
  }: SendPasswordResetEmailParams): Promise<void> {
    const config = this.configService.get('config') as Configuration;
    const url = `${config.baseUrl}/reset-password?token=${token}`;
    const template = this.templates[language].passwordReset;
    const html = template({
      reset_url: url,
    });

    await this.strategy.send(to, 'Reset your password', html);
  }

  async sendWelcomeEmail({
    to,
    language,
  }: SendWelcomeEmailParams): Promise<void> {
    const template = this.templates[language].welcome;
    const html = template({
      currentYear: new Date().getFullYear(),
      website_url: this.configService.get('config').websiteUrl,
      privacy_url: this.configService.get('config').privacyUrl,
      terms_url: this.configService.get('config').termsUrl,
      support_email: this.configService.get('config').supportEmail,
      support_phone: this.configService.get('config').supportPhone,
      support_contact: this.configService.get('config').supportContact,
      support_address: this.configService.get('config').supportAddress,
    });

    await this.strategy.send(to, 'Welcome!', html);
  }

  async sendCustomEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    await this.strategy.send(to, subject, html);
  }
}
