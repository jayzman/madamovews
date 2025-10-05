"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChauffeursModule = void 0;
const common_1 = require("@nestjs/common");
const chauffeurs_service_1 = require("./chauffeurs.service");
const chauffeurs_controller_1 = require("./chauffeurs.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const uploads_module_1 = require("../uploads/uploads.module");
const email_service_1 = require("../email.service");
const sms_service_1 = require("../sms.service");
const jwt_1 = require("@nestjs/jwt");
const chauffeur_jwt_strategy_1 = require("./strategies/chauffeur-jwt.strategy");
const config_1 = require("@nestjs/config");
let ChauffeursModule = class ChauffeursModule {
};
exports.ChauffeursModule = ChauffeursModule;
exports.ChauffeursModule = ChauffeursModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, uploads_module_1.UploadsModule, config_1.ConfigModule],
        controllers: [chauffeurs_controller_1.ChauffeursController],
        providers: [chauffeurs_service_1.ChauffeursService, email_service_1.MailService, sms_service_1.SmsService, jwt_1.JwtService, chauffeur_jwt_strategy_1.ChauffeurJwtStrategy],
        exports: [chauffeurs_service_1.ChauffeursService],
    })
], ChauffeursModule);
//# sourceMappingURL=chauffeurs.module.js.map