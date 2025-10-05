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
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const twilio_1 = require("twilio");
let SmsService = class SmsService {
    constructor(configService) {
        this.configService = configService;
        this.otpStorage = new Map();
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        this.twilioClient = new twilio_1.Twilio(accountSid, authToken);
    }
    async sendSms(to, body) {
        const from = this.configService.get('TWILIO_PHONE_NUMBER');
        try {
            await this.twilioClient.messages.create({
                to,
                from,
                body,
            });
            console.log(`SMS sent to ${to}`);
        }
        catch (error) {
            console.error('Failed to send SMS:', error);
            throw error;
        }
    }
    async sendCustomSms(sendSmsDto) {
        const { to, message } = sendSmsDto;
        const from = this.configService.get('TWILIO_PHONE_NUMBER');
        const results = [];
        const recipients = Array.isArray(to) ? to : [to];
        for (const recipient of recipients) {
            try {
                const result = await this.twilioClient.messages.create({
                    to: recipient,
                    from,
                    body: message,
                });
                results.push({
                    to: recipient,
                    success: true,
                    sid: result.sid,
                    status: result.status
                });
                console.log(`SMS sent successfully to ${recipient}`);
            }
            catch (error) {
                results.push({
                    to: recipient,
                    success: false,
                    error: error.message
                });
                console.error(`Failed to send SMS to ${recipient}:`, error);
            }
        }
        return {
            success: results.every(r => r.success),
            results
        };
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async sendOtp(phoneNumber) {
        const otp = this.generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        this.otpStorage.set(phoneNumber, {
            phoneNumber,
            otp,
            expiresAt
        });
        const message = `Votre code de vérification MEMA est: ${otp}. Ce code expire dans 5 minutes.`;
        await this.sendSms(phoneNumber, message);
        return otp;
    }
    async verifyOtp(phoneNumber, providedOtp) {
        const otpData = this.otpStorage.get(phoneNumber);
        if (!otpData) {
            throw new Error('Aucun code OTP trouvé pour ce numéro');
        }
        if (new Date() > otpData.expiresAt) {
            this.otpStorage.delete(phoneNumber);
            throw new Error('Le code OTP a expiré');
        }
        if (otpData.otp !== providedOtp) {
            throw new Error('Code OTP incorrect');
        }
        this.otpStorage.delete(phoneNumber);
        return true;
    }
    async resendOtp(phoneNumber) {
        this.otpStorage.delete(phoneNumber);
        return await this.sendOtp(phoneNumber);
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SmsService);
//# sourceMappingURL=sms.service.js.map