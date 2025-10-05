"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsModule = void 0;
const common_1 = require("@nestjs/common");
const clients_service_1 = require("./clients.service");
const clients_controller_1 = require("./clients.controller");
const email_service_1 = require("../email.service");
const sms_service_1 = require("../sms.service");
const jwt_1 = require("@nestjs/jwt");
const client_jwt_strategy_1 = require("./strategies/client-jwt.strategy");
const config_1 = require("@nestjs/config");
let ClientsModule = class ClientsModule {
};
exports.ClientsModule = ClientsModule;
exports.ClientsModule = ClientsModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        controllers: [clients_controller_1.ClientsController],
        providers: [clients_service_1.ClientsService, email_service_1.MailService, sms_service_1.SmsService, jwt_1.JwtService, client_jwt_strategy_1.ClientJwtStrategy],
        exports: [clients_service_1.ClientsService],
    })
], ClientsModule);
//# sourceMappingURL=clients.module.js.map