import {
  Controller,
  Post,
  Req,
  Res,
  HttpCode,
  Body,
  BadRequestException,
  SetMetadata,
  Get,
  Headers,
  RawBodyRequest,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';
import { Public } from '@/utils/secure';
import { User } from '@/entities/User';
import { Role } from '@/types/role';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Configuration } from '@/types/configuration';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly configService: ConfigService,
    private readonly stripeService: StripeService,
  ) {}

  @Public()
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const config = this.configService.get('config') as Configuration;
    if (!signature) {
      throw new BadRequestException('Stripe signature is required');
    }

    const rawBody = req.body;
    if (!(rawBody instanceof Buffer)) {
      throw new BadRequestException('Request body is required');
    }

    if (!config.stripe.webhookSecret) {
      throw new BadRequestException('Stripe webhook secret is not configured');
    }

    let event: Stripe.Event;

    try {
      event = Stripe.webhooks.constructEvent(
        rawBody,
        signature,
        config.stripe.webhookSecret,
      );

      await this.stripeService.handleEvent(event);

      return res.status(200).json({ received: true });
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Post('attach-payment-method')
  async attachPaymentMethod(
    @Res() res: Response,
    @Req() req: Request & { user: User },
    @Body('paymentMethodId') paymentMethodId: string,
  ) {
    if (!paymentMethodId) {
      throw new BadRequestException('Payment method ID is required');
    }

    const paymentMethod = await this.stripeService.attachPaymentMethod(
      req.user.id,
      paymentMethodId,
    );
    return res.status(200).json(paymentMethod);
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Post('create-setup-intent')
  async createSetupIntent(
    @Res() res: Response,
    @Req() req: Request & { user: User },
  ) {
    try {
      const setupIntent = await this.stripeService.createSetupIntent(
        req.user.email,
      );
      return res.status(200).json(setupIntent);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Get('payment-method')
  async getPaymentMethods(
    @Res() res: Response,
    @Req() req: Request & { user: User },
  ) {
    try {
      const paymentMethods = await this.stripeService.getPaymentMethod(
        req.user.id,
      );
      if (!paymentMethods) {
        return res.status(204).json({ message: 'No payment methods found' });
      }

      return res.status(200).json(paymentMethods);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Get('billings')
  async getBillings(
    @Res() res: Response,
    @Req() req: Request & { user: User },
  ) {
    try {
      const billings = await this.stripeService.getBillings(req.user.id);
      return res.status(200).json(billings);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
