import { Injectable } from "@nestjs/common";
import Stripe from "stripe";
import { ConfigService } from "@nestjs/config";
import { NotificationsService } from "../notifications/notifications.service";
import { TypeNotification } from "../notifications/dto/create-notification.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private notificationsService: NotificationsService,
    private prisma: PrismaService
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>("STRIPE_SECRET_KEY"),
      {
        apiVersion: "2025-03-31.basil",
      }
    );
  }

  async createCustomer(name: string, email: string) {
    const stripeCustomer = await this.stripe.customers.create({
      name,
      email,
    });

    const client = await this.prisma.client.findFirst({
      where: { email },
    });

    if (client && !client.stripeCustomerId) {
      await this.prisma.client.update({
        where: { id: client.id },
        data: { stripeCustomerId: stripeCustomer.id },
      });
    }

    return stripeCustomer;
  }
  async createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string,
    metadata: Record<string, string>,
    paymentMethodId?: string
  ) {
    const baseUrl =
      this.configService.get<string>("BASE_URL") ||
      "https://votre-application.com";
    const paymentIntentOptions: Stripe.PaymentIntentCreateParams = {
      amount,
      currency,
      customer: customerId,
      metadata,
      capture_method: "manual",
      confirm: false, // On ne confirme pas tout de suite
      payment_method_types: ["card"],
    };

    if (paymentMethodId) {
      paymentIntentOptions.payment_method = paymentMethodId;
      paymentIntentOptions.confirm = true;
    }

    // Ajouter l'option setup_future_usage si spécifiée
    // if (setupFutureUsage) {
    //   paymentIntentOptions.setup_future_usage = setupFutureUsage;
    // }

    const paymentIntent = await this.stripe.paymentIntents.create(
      paymentIntentOptions
    );

    const client = await this.prisma.client.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (client) {
      await this.notificationsService.create({
        titre: "Paiement en attente",
        message: `Une demande de paiement de ${
          amount / 100
        }€ est en cours de traitement.`,
        type: TypeNotification.PAIEMENT,
        clientId: client.id,
        donnees: JSON.stringify({
          amount: amount / 100,
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
        }),
      });
    }

    return paymentIntent;
  }

  async updatePaymentIntent(
    paymentIntentId: string,
    data: Partial<Stripe.PaymentIntentUpdateParams>
  ) {
    return this.stripe.paymentIntents.update(paymentIntentId, data);
  }

  async capturePaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.capture(paymentIntentId);
  }
  async retrievePaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }
  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string) {
    return this.stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
      return_url: "https://votre-application.com/payment/return", // URL factice car nous ne l'utiliserons pas
    });
  }

  async retrieveSetupIntent(setupIntentId: string) {
    return this.stripe.setupIntents.retrieve(setupIntentId);
  }

  async createCheckoutSession(
    amount: number,
    currency: string,
    customerId: string,
    successUrl: string,
    cancelUrl: string,
    metadata: Record<string, string>
  ) {
    return this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: "Location de véhicule",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer: customerId,
      metadata,
    });
  }

  async createSetupIntent(
    customerId: string,
    metadata: Record<string, string>
  ) {
    const setupIntent = await this.stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      metadata,
      usage: "off_session", // Pour utilisation future sans présence du client
    });

    return setupIntent;
  }

  async createSetupSession(
    customerId: string,
    successUrl: string,
    cancelUrl: string,
    metadata: Record<string, string>
  ) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "setup",
      customer: customerId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });

    return session;
  }

  async retrieveCheckoutSession(sessionId: string) {
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }

  async constructEventFromPayload(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>(
      "STRIPE_WEBHOOK_SECRET"
    );
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
  }

  async handleCardEvents(event: Stripe.Event) {
    switch (event.type) {
      case "payment_method.attached":
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        if (paymentMethod.customer && paymentMethod.card) {
          const client = await this.prisma.client.findFirst({
            where: { stripeCustomerId: paymentMethod.customer as string },
          });

          if (client) {
            const lastFourDigits = paymentMethod.card.last4;
            await this.notificationsService.createCardAddedNotification(
              client.id,
              lastFourDigits
            );
          }
        }
        break;

      case "payment_method.updated":
        break;
    }
  }

  async handlePaymentEvents(event: Stripe.Event) {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        if (paymentIntent.customer && paymentIntent.amount) {
          const client = await this.prisma.client.findFirst({
            where: { stripeCustomerId: paymentIntent.customer as string },
          });

          if (client) {
            await this.notificationsService.createPaymentSuccessNotification(
              client.id,
              paymentIntent.amount / 100,
              paymentIntent.id
            );
          }
        }
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        if (failedPayment.customer) {
          const client = await this.prisma.client.findFirst({
            where: { stripeCustomerId: failedPayment.customer as string },
          });

          if (client) {
            await this.notificationsService.create({
              titre: "Échec de paiement",
              message:
                "Votre paiement n'a pas pu être traité. Veuillez vérifier votre méthode de paiement.",
              type: TypeNotification.PAIEMENT,
              clientId: client.id,
              donnees: JSON.stringify({
                amount: failedPayment.amount / 100,
                paymentIntentId: failedPayment.id,
                status: failedPayment.status,
                error:
                  failedPayment.last_payment_error?.message ||
                  "Erreur inconnue",
              }),
            });
          }
        }
        break;
    }
  }
}
