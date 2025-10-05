import Stripe from "stripe";
import { ConfigService } from "@nestjs/config";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
export declare class StripeService {
    private configService;
    private notificationsService;
    private prisma;
    private stripe;
    constructor(configService: ConfigService, notificationsService: NotificationsService, prisma: PrismaService);
    createCustomer(name: string, email: string): Promise<Stripe.Response<Stripe.Customer>>;
    createPaymentIntent(amount: number, currency: string, customerId: string, metadata: Record<string, string>, paymentMethodId?: string): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    updatePaymentIntent(paymentIntentId: string, data: Partial<Stripe.PaymentIntentUpdateParams>): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    capturePaymentIntent(paymentIntentId: string): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    retrieveSetupIntent(setupIntentId: string): Promise<Stripe.Response<Stripe.SetupIntent>>;
    createCheckoutSession(amount: number, currency: string, customerId: string, successUrl: string, cancelUrl: string, metadata: Record<string, string>): Promise<Stripe.Response<Stripe.Checkout.Session>>;
    createSetupIntent(customerId: string, metadata: Record<string, string>): Promise<Stripe.Response<Stripe.SetupIntent>>;
    createSetupSession(customerId: string, successUrl: string, cancelUrl: string, metadata: Record<string, string>): Promise<Stripe.Response<Stripe.Checkout.Session>>;
    retrieveCheckoutSession(sessionId: string): Promise<Stripe.Response<Stripe.Checkout.Session>>;
    constructEventFromPayload(signature: string, payload: Buffer): Promise<Stripe.Event>;
    handleCardEvents(event: Stripe.Event): Promise<void>;
    handlePaymentEvents(event: Stripe.Event): Promise<void>;
}
