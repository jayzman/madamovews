import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { join } from "path";
import * as express from "express";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ✅ Active CORS avec configuration précise
  app.enableCors({
    origin: ['http://51.68.154.110','http://localhost:3001', 'http://localhost:3000', 'https://madamove.fr', 'https://api.madamove.fr', 'file://'], // Ajout de localhost et file:// pour les tests
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  });

  // ✅ Cookies parser
  app.use(cookieParser());

  // ✅ Body parser configuration
  app.use((req, res, next) => {
    const stripeWebhookEndpoints = [
      '/api/locations/webhook',
      '/api/payments/webhook' // Endpoint pour les webhooks de paiement avec codes promo
    ];
    // Utiliser raw body parser uniquement pour les webhooks Stripe
    if (stripeWebhookEndpoints.includes(req.originalUrl) && req.method === 'POST') {
      bodyParser.raw({ type: 'application/json' })(req, res, next);
    } else {
      bodyParser.json()(req, res, next);
    }
  });

  // ✅ Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Préfixe d'API
  app.setGlobalPrefix("api");

  // ✅ Swagger config
  const config = new DocumentBuilder()
    .setTitle("MADAMOVE API")
    .setDescription("API pour la gestion des chauffeurs, véhicules et courses")
    .setVersion("1.0")
    .addBearerAuth({ in: 'header', type: 'http' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // ✅ Servir les fichiers statiques
  app.use("/uploads", express.static(join(__dirname, "..", "uploads")));

  await app.listen(3001);
  console.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();
