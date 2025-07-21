import { Configuration } from '@/types/configuration';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { UsersService } from '../users/users.service';
import { PlansService } from '../plans/plans.service';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly plansService: PlansService,
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

  async createCheckoutSession(params: { customerId: string; priceId: string }) {
    return this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: params.customerId,
      line_items: [{ price: params.priceId, quantity: 1 }],
    });
  }

  async getProductPrice(priceId: string): Promise<Stripe.Price> {
    return this.stripe.prices.retrieve(priceId);
  }

  async subscribeToPlan(
    userId: string,
    planId: string,
  ): Promise<Stripe.Subscription> {
    const user = await this.usersService.findOne({
      where: { id: userId },
      select: ['id', 'stripeCustomerId'],
    });

    if (!user?.stripeCustomerId) {
      throw new NotFoundException(
        'User not found or does not have a Stripe customer ID.',
      );
    }

    const plan = await this.plansService.findOne({
      where: { id: planId },
      select: ['id', 'stripePriceId'],
    });

    if (!plan) {
      throw new NotFoundException('Plan not found.');
    }

    let subscription: Stripe.Subscription;

    const existingSubscriptions = await this.stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active', // O 'trialing', 'past_due' si también quieres considerar esos estados
      limit: 1,
    });

    if (existingSubscriptions.data.length > 0) {
      const currentSubscription = existingSubscriptions.data[0];
      const currentSubscriptionItem = currentSubscription.items.data[0];

      if (currentSubscriptionItem.price.id === plan.stripePriceId) {
        return currentSubscription;
      }

      console.log(
        `Updating subscription ${currentSubscription.id} for customer ${user.stripeCustomerId} from ${currentSubscriptionItem.price.id} to ${plan.stripePriceId}`,
      );

      subscription = await this.stripe.subscriptions.update(
        currentSubscription.id,
        {
          items: [
            {
              id: currentSubscriptionItem.id,
              price: plan.stripePriceId,
            },
          ],

          expand: ['latest_invoice.payment_intent'],
        },
      );
    } else {
      console.log(
        `Creating new subscription for customer ${user.stripeCustomerId} with plan ${plan.stripePriceId}`,
      );
      subscription = await this.stripe.subscriptions.create({
        customer: user.stripeCustomerId,
        items: [{ price: plan.stripePriceId }],
        expand: ['latest_invoice.payment_intent'],
      });
    }

    return subscription;
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

    await this.stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethod.id },
    });

    return paymentMethod;
  }

  async createSetupIntent(email: string) {
    const user = await this.usersService.findOne({
      select: ['id', 'firstName', 'lastName', 'phone', 'stripeCustomerId'],
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const createUser = async () => {
      const customer = await this.stripe.customers.create({
        name: `${user.firstName} ${user.lastName}`,
        email,
        phone: user.phone || undefined,
        metadata: { userId: user.id },
      });
      await this.usersService.update(user.id, {
        stripeCustomerId: customer.id,
      });
      user.stripeCustomerId = customer.id;
    };

    if (!user.stripeCustomerId || user.stripeCustomerId === '') {
      const customer = await this.stripe.customers.list({
        email,
        limit: 1,
      });
      if (customer.data.length > 0) {
        user.stripeCustomerId = customer.data[0].id;
        await this.usersService.update(user.id, {
          stripeCustomerId: user.stripeCustomerId,
        });
      } else {
        await createUser();
      }
    } else {
      const customer = await this.stripe.customers.retrieve(
        user.stripeCustomerId,
      );
      if (!customer || customer.deleted) await createUser();
    }

    const intent = await this.stripe.setupIntents.create({
      customer: user.stripeCustomerId!,
      payment_method_types: ['card'],
    });

    return {
      clientSecret: intent.client_secret,
      customerId: user.stripeCustomerId,
    };
  }

  async getPaymentMethod(userId: string) {
    const user = await this.usersService.findOne({
      where: { id: userId },
      select: ['id', 'stripeCustomerId', 'defaultPaymentMethodId'],
    });

    if (!user?.stripeCustomerId) {
      throw new NotFoundException('User not found');
    }

    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    const paymentMethod = (paymentMethods.data || []).filter(
      (pm) =>
        pm.id === user.defaultPaymentMethodId ||
        pm.card?.checks?.cvc_check === 'pass',
    );

    return paymentMethod[0];
  }

  async getBillings(userId: string) {
    const user = await this.usersService.findOne({
      where: { id: userId },
      select: ['id', 'stripeCustomerId'],
    });

    if (!user?.stripeCustomerId) {
      throw new NotFoundException('User not found');
    }

    const billings = await this.stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 100,
    });

    return billings.data;
  }

  async getSubscriptionDetails(subscription: Stripe.Subscription) {
    const config = this.configService.get('config') as Configuration;
    const customerId = subscription.customer as string;
    const user = await this.usersService.findOne({
      where: { stripeCustomerId: customerId },
      select: ['id', 'email'],
    });
    if (!user) {
      console.error(
        `User not found for customer ID ${customerId} in subscription.created event`,
      );
      throw new NotFoundException(
        `User with customer ID ${customerId} not found`,
      );
    }

    if (subscription.items.data.length === 0) {
      console.warn(
        `No items found in subscription for customer ID ${customerId}`,
      );
      throw new NotFoundException(
        `No subscription items found for customer ID ${customerId}`,
      );
    }
    // Una suscripción puede tener múltiples ítems, pero lo más común es uno.
    const subscriptionItem = subscription.items.data[0]; // Tomamos el primer ítem
    const priceId = subscriptionItem.price.id; // ID del precio (Stripe Price ID)
    const priceObject = subscriptionItem.price;

    if (typeof priceObject.product !== 'string') {
      console.error(
        `Invalid product ID type for price ID ${priceId} in subscription.created event`,
      );
      throw new NotFoundException(
        `Product ID for price ${priceId} is not a string`,
      );
    }

    const productId = priceObject.product;
    if (config.stripe.productId !== productId) {
      console.warn(
        `Product ID mismatch: expected ${config.stripe.productId}, got ${productId}`,
      );
      throw new NotFoundException(
        `Product with ID ${productId} not found in configuration`,
      );
    }

    const plan = await this.plansService.findOne({
      where: { stripePriceId: priceId },
      select: ['id', 'name'],
    });

    if (!plan) {
      console.error(
        `Plan not found for price ID ${priceId} in subscription.created event`,
      );
      throw new NotFoundException(
        `Plan with ID ${priceId} not found in configuration`,
      );
    }

    return {
      user,
      plan,
      status: subscription.status,
      currentPeriodStart: new Date(
        subscriptionItem.current_period_start * 1000,
      ),
      currentPeriodEnd: new Date(subscriptionItem.current_period_end * 1000),
      priceId: priceId,
      priceObject: priceObject,
    };
  }

  async handleEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.pending_update_applied':
      case 'customer.subscription.pending_update_expired':
      case 'customer.subscription.resumed':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const { user, plan, status, currentPeriodStart, currentPeriodEnd } =
          await this.getSubscriptionDetails(subscription);

        await this.usersService.update(user.id, {
          planId: plan.id,
          planStartDate: currentPeriodStart,
          planEndDate: currentPeriodEnd,
          planStatus: status,
          stripeSubscriptionId: subscription.id,
        });

        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }
}
