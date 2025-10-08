import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { join } from "path";
import * as express from "express";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";

async function bootstrap() {
  const logger = new Logger('Bootstrap'); // Logger pour suivre les événements importants
  const app = await NestFactory.create(AppModule);

  // ✅ Active CORS avec configuration précise
  app.enableCors({
    origin: ['http://51.68.154.110', 'http://localhost:3001', 'http://localhost:3000', 'https://madamove.fr', 'https://api.madamove.fr', 'file://'], // Ajout de localhost et file:// pour les tests
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
      '/api/payments/webhook', // Endpoint pour les webhooks de paiement avec codes promo
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

  // ✅ Middleware pour protéger Swagger avec username/password
app.use('/api', (req, res, next) => {
  const auth = { login: 'admin', password: 'madamove2025' }; // Remplacez par vos identifiants
  const AUTH_COOKIE_NAME = 'swagger_auth'; // Nom du cookie d'authentification

  // Vérifie si le cookie d'authentification est présent
  if (req.cookies[AUTH_COOKIE_NAME] === 'authenticated') {
    return next(); // Si le cookie est valide, autorise l'accès
  }

  // Vérifie les headers Authorization pour une authentification HTTP Basic
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  // Vérifie les identifiants
  if (login && password && login === auth.login && password === auth.password) {
    // Définit un cookie pour se souvenir de l'utilisateur authentifié
    res.cookie(AUTH_COOKIE_NAME, 'authenticated', {
      httpOnly: true, // Empêche l'accès au cookie via JavaScript côté client
      secure: false, // Passez à `true` si vous utilisez HTTPS
      maxAge: 60 * 60 * 1000, // Durée de vie du cookie : 1 heure
    });
    return next(); // Autorise l'accès
  }

  // Si les identifiants sont invalides, renvoie une erreur 401
  res.set('WWW-Authenticate', 'Basic realm="401"'); // Invite l'utilisateur à entrer ses identifiants
  res.status(401).send('Authentication required.');
});

  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  logger.log('Swagger documentation is available at /api');

  // ✅ Servir les fichiers statiques
  app.use("/uploads", express.static(join(__dirname, "..", "uploads")));

  // ✅ Gestion des erreurs globales
  app.useGlobalFilters();

  // ✅ Démarrage du serveur
  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);
  logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
}
bootstrap();