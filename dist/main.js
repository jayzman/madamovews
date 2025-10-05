"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: ['http://51.68.154.110', 'http://localhost:3001', 'http://localhost:3000', 'https://madamove.fr', 'https://api.madamove.fr', 'file://'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
    });
    app.use(cookieParser());
    app.use((req, res, next) => {
        const stripeWebhookEndpoints = [
            '/api/locations/webhook',
            '/api/payments/webhook'
        ];
        if (stripeWebhookEndpoints.includes(req.originalUrl) && req.method === 'POST') {
            bodyParser.raw({ type: 'application/json' })(req, res, next);
        }
        else {
            bodyParser.json()(req, res, next);
        }
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.setGlobalPrefix("api");
    const config = new swagger_1.DocumentBuilder()
        .setTitle("MADAMOVE API")
        .setDescription("API pour la gestion des chauffeurs, véhicules et courses")
        .setVersion("1.0")
        .addBearerAuth({ in: 'header', type: 'http' })
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api", app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    app.use("/uploads", express.static((0, path_1.join)(__dirname, "..", "uploads")));
    await app.listen(3001);
    console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();
//# sourceMappingURL=main.js.map