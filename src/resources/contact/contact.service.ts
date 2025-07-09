import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { EmailService } from '@/services/email/email.service';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '@/types/configuration';

@Injectable()
export class ContactService {
  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async create(payloar: CreateContactDto): Promise<string> {
    const config = this.configService.get('config') as Configuration;
    const { name, email, subject, message } = payloar;

    if (!config.email.contact) {
      throw new InternalServerErrorException('Contact email is not configured');
    }

    await this.emailService.sendEmail(
      config.email.contact,
      `Contact Form Submission: ${subject}`,
      `<p>You have a new contact form submission from <strong>${name}</strong> (${email}):</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p><strong>Phone:</strong> ${payloar.phone || 'N/A'}</p>
      <p><strong>Company:</strong> ${payloar.company || 'N/A'}</p>
      `,
    );

    return 'Contact form submitted successfully';
  }
}
