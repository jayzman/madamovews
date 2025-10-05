"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = require("stripe");
const config_1 = require("@nestjs/config");
const notifications_service_1 = require("../notifications/notifications.service");
const create_notification_dto_1 = require("../notifications/dto/create-notification.dto");
const prisma_service_1 = require("../prisma/prisma.service");
let StripeService = class StripeService {
    constructor(configService, notificationsService, prisma) {
        this.configService = configService;
        this.notificationsService = notificationsService;
        this.prisma = prisma;
        this.stripe = new stripe_1.default(this.configService.get("STRIPE_SECRET_KEY"), {
            apiVersion: "2025-03-31.basil",
        });
    }
    async createCustomer(name, email) {
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
    async createPaymentIntent(amount, currency, customerId, metadata, paymentMethodId) {
        const baseUrl = this.configService.get("BASE_URL") ||
            "https://votre-application.com";
        const paymentIntentOptions = {
            amount,
            currency,
            customer: customerId,
            metadata,
            capture_method: "manual",
            confirm: false,
            payment_method_types: ["card"],
        };
        if (paymentMethodId) {
            paymentIntentOptions.payment_method = paymentMethodId;
            paymentIntentOptions.confirm = true;
        }
        const paymentIntent = await this.stripe.paymentIntents.create(paymentIntentOptions);
        const client = await this.prisma.client.findFirst({
            where: { stripeCustomerId: customerId },
        });
        if (client) {
            await this.notificationsService.create({
                titre: "Paiement en attente",
                message: `Une demande de paiement de ${amount / 100}€ est en cours de traitement.`,
                type: create_notification_dto_1.TypeNotification.PAIEMENT,
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
    async updatePaymentIntent(paymentIntentId, data) {
        return this.stripe.paymentIntents.update(paymentIntentId, data);
    }
    async capturePaymentIntent(paymentIntentId) {
        return this.stripe.paymentIntents.capture(paymentIntentId);
    }
    async retrievePaymentIntent(paymentIntentId) {
        return this.stripe.paymentIntents.retrieve(paymentIntentId);
    }
    async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
        return this.stripe.paymentIntents.confirm(paymentIntentId, {
            payment_method: paymentMethodId,
            return_url: "https://votre-application.com/payment/return",
        });
    }
    async retrieveSetupIntent(setupIntentId) {
        return this.stripe.setupIntents.retrieve(setupIntentId);
    }
    async createCheckoutSession(amount, currency, customerId, successUrl, cancelUrl, metadata) {
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
    async createSetupIntent(customerId, metadata) {
        const setupIntent = await this.stripe.setupIntents.create({
            customer: customerId,
            payment_method_types: ["card"],
            metadata,
            usage: "off_session",
        });
        return setupIntent;
    }
    async createSetupSession(customerId, successUrl, cancelUrl, metadata) {
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
    async retrieveCheckoutSession(sessionId) {
        return this.stripe.checkout.sessions.retrieve(sessionId);
    }
    async constructEventFromPayload(signature, payload) {
        const webhookSecret = this.configService.get("STRIPE_WEBHOOK_SECRET");
        return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    }
    async handleCardEvents(event) {
        switch (event.type) {
            case "payment_method.attached":
                const paymentMethod = event.data.object;
                if (paymentMethod.customer && paymentMethod.card) {
                    const client = await this.prisma.client.findFirst({
                        where: { stripeCustomerId: paymentMethod.customer },
                    });
                    if (client) {
                        const lastFourDigits = paymentMethod.card.last4;
                        await this.notificationsService.createCardAddedNotification(client.id, lastFourDigits);
                    }
                }
                break;
            case "payment_method.updated":
                break;
        }
    }
    async handlePaymentEvents(event) {
        switch (event.type) {
            case "payment_intent.succeeded":
                const paymentIntent = event.data.object;
                if (paymentIntent.customer && paymentIntent.amount) {
                    const client = await this.prisma.client.findFirst({
                        where: { stripeCustomerId: paymentIntent.customer },
                    });
                    if (client) {
                        await this.notificationsService.createPaymentSuccessNotification(client.id, paymentIntent.amount / 100, paymentIntent.id);
                    }
                }
                break;
            case "payment_intent.payment_failed":
                const failedPayment = event.data.object;
                if (failedPayment.customer) {
                    const client = await this.prisma.client.findFirst({
                        where: { stripeCustomerId: failedPayment.customer },
                    });
                    if (client) {
                        await this.notificationsService.create({
                            titre: "Échec de paiement",
                            message: "Votre paiement n'a pas pu être traité. Veuillez vérifier votre méthode de paiement.",
                            type: create_notification_dto_1.TypeNotification.PAIEMENT,
                            clientId: client.id,
                            donnees: JSON.stringify({
                                amount: failedPayment.amount / 100,
                                paymentIntentId: failedPayment.id,
                                status: failedPayment.status,
                                error: failedPayment.last_payment_error?.message ||
                                    "Erreur inconnue",
                            }),
                        });
                    }
                }
                break;
        }
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        notifications_service_1.NotificationsService,
        prisma_service_1.PrismaService])
], StripeService);
//# sourceMappingURL=stripe.service.js.map