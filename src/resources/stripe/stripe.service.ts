import { Configuration } from '@/types/configuration';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { UsersService } from '../users/users.service';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const stripeConf = this.configService.get<Configuration>('config')?.stripe;
    if (!stripeConf?.secretKey) {
      throw new Error('Stripe secret key is not configured');
    }

    this.stripe = new Stripe(stripeConf.secretKey, {
      apiVersion: '2025-06-30.basil',
      appInfo: {
        name: 'OnnaSoft Odoo API',
        version: '1.0.0',
      },
      typescript: true,
    });
  }

  async createCustomer(email: string) {
    return this.stripe.customers.create({ email });
  }

  async createCheckoutSession(params: { customerId: string; priceId: string }) {
    return this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: params.customerId,
      line_items: [{ price: params.priceId, quantity: 1 }],
    });
  }

  async getCustomer(customerId: string) {
    return this.stripe.customers.retrieve(customerId);
  }

  async attachPaymentMethod(userId: string, paymentMethodId: string) {
    const user = await this.usersService.findOne({
      where: { id: userId },
      select: ['id', 'stripeCustomerId'],
    });

    if (!user?.stripeCustomerId) {
      throw new NotFoundException('User not found');
    }

    const paymentMethod = await this.stripe.paymentMethods.attach(
      paymentMethodId,
      { customer: user?.stripeCustomerId },
    );

    await this.usersService.update(user.id, {
      defaultPaymentMethodId: paymentMethod.id,
    });

    // Set the default payment method for the customer
    await this.stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethod.id },
    });

    return paymentMethod;
  }

  async createSetupIntent(email: string) {
    const user = await this.usersService.findOne({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.stripeCustomerId) {
      const customer = await this.stripe.customers.create({ email });
      user.stripeCustomerId = customer.id;
      await this.usersService.update(user.id, {
        stripeCustomerId: customer.id,
      });
    }

    const setupIntent = await this.stripe.setupIntents.create({
      customer: user.stripeCustomerId,
    });

    return {
      clientSecret: setupIntent.client_secret,
      customerId: user.stripeCustomerId,
    };
  }

  async handleWebhook(payload: Buffer, sig: string) {
    const stripeConf = this.configService.get<Configuration>('config')?.stripe;
    if (!stripeConf?.webhookSecret) {
      throw new Error('Stripe webhook secret is not configured');
    }
    const secret = stripeConf.webhookSecret;
    return this.stripe.webhooks.constructEvent(payload, sig, secret);
  }
}
