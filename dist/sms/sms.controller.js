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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sms_service_1 = require("../sms.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let SmsController = class SmsController {
    constructor(smsService) {
        this.smsService = smsService;
    }
    async sendCustomSms(sendSmsDto) {
        return await this.smsService.sendCustomSms(sendSmsDto);
    }
    async sendOtp(phoneNumber) {
        const otp = await this.smsService.sendOtp(phoneNumber);
        return {
            message: 'Code OTP envoyé avec succès',
            phoneNumber,
        };
    }
    async verifyOtp(phoneNumber, otp) {
        const isValid = await this.smsService.verifyOtp(phoneNumber, otp);
        return {
            message: 'Code OTP vérifié avec succès',
            valid: isValid,
        };
    }
    async resendOtp(phoneNumber) {
        await this.smsService.resendOtp(phoneNumber);
        return {
            message: 'Nouveau code OTP envoyé avec succès',
            phoneNumber,
        };
    }
};
exports.SmsController = SmsController;
__decorate([
    (0, common_1.Post)('send'),
    (0, swagger_1.ApiOperation)({ summary: 'Envoyer un SMS personnalisé à un ou plusieurs destinataires' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'SMS envoyé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Erreur lors de l\'envoi du SMS' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SmsController.prototype, "sendCustomSms", null);
__decorate([
    (0, common_1.Post)('send-otp'),
    (0, swagger_1.ApiOperation)({ summary: 'Envoyer un code OTP à un numéro de téléphone' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Code OTP envoyé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Erreur lors de l\'envoi de l\'OTP' }),
    __param(0, (0, common_1.Body)('phoneNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SmsController.prototype, "sendOtp", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    (0, swagger_1.ApiOperation)({ summary: 'Vérifier un code OTP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Code OTP vérifié avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Code OTP invalide ou expiré' }),
    __param(0, (0, common_1.Body)('phoneNumber')),
    __param(1, (0, common_1.Body)('otp')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SmsController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('resend-otp'),
    (0, swagger_1.ApiOperation)({ summary: 'Renvoyer un code OTP' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Nouveau code OTP envoyé' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Erreur lors du renvoi de l\'OTP' }),
    __param(0, (0, common_1.Body)('phoneNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SmsController.prototype, "resendOtp", null);
exports.SmsController = SmsController = __decorate([
    (0, swagger_1.ApiTags)('sms'),
    (0, common_1.Controller)('sms'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [sms_service_1.SmsService])
], SmsController);
//# sourceMappingURL=sms.controller.js.map