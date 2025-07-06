import {
  Controller,
  Post,
  Req,
  Res,
  HttpCode,
  Body,
  BadRequestException,
  SetMetadata,
} from '@nestjs/common';
import { Response } from 'express';
import { StripeService } from './stripe.service';
import { Public } from '@/utils/secure';
import { User } from '@/entities/User';
import { Role } from '@/types/role';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Public()
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook() {
    //@Req() req: Request,
    //@Res() res: Response,
    //@Headers('stripe-signature') signature: string,
    throw new BadRequestException(
      'Webhook endpoint is not implemented yet. Please implement it to handle Stripe events.',
    );
  }

  @SetMetadata('roles', [Role.User, Role.Admin])
  @Post('attach-payment-method')
  async attachPaymentMethod(
    @Res() res: Response,
    @Req() req: Express.Request & { user: User },
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
  async createSetupIntent(@Res() res: Response, @Body('email') email: string) {
    try {
      const setupIntent = await this.stripeService.createSetupIntent(email);
      return res.status(200).json(setupIntent);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}
