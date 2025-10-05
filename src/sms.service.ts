import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

export interface SendSmsDto {
  to: string | string[];
  message: string;
}

export interface OtpData {
  phoneNumber: string;
  otp: string;
  expiresAt: Date;
}

@Injectable()
export class SmsService {
    private twilioClient: Twilio;
    private otpStorage = new Map<string, OtpData>(); // En production, utilisez Redis ou base de données

    constructor(private readonly configService: ConfigService) {
        const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
        this.twilioClient = new Twilio(accountSid, authToken);
    }

    async sendSms(to: string, body: string): Promise<void> {
        const from = this.configService.get<string>('TWILIO_PHONE_NUMBER');
        try {
            await this.twilioClient.messages.create({
                to,
                from,
                body,
            });
            console.log(`SMS sent to ${to}`);
        } catch (error) {
            console.error('Failed to send SMS:', error);
            throw error;
        }
    }

    async sendCustomSms(sendSmsDto: SendSmsDto): Promise<{ success: boolean; results: any[] }> {
        const { to, message } = sendSmsDto;
        const from = this.configService.get<string>('TWILIO_PHONE_NUMBER');
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
            } catch (error) {
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

    generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendOtp(phoneNumber: string): Promise<string> {
        const otp = this.generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes d'expiration

        // Stocker l'OTP
        this.otpStorage.set(phoneNumber, {
            phoneNumber,
            otp,
            expiresAt
        });

        // Envoyer l'OTP par SMS
        const message = `Votre code de vérification MADAMOVE est: ${otp}. Ce code expire dans 5 minutes.`;
        await this.sendSms(phoneNumber, message);

        return otp;
    }

    async verifyOtp(phoneNumber: string, providedOtp: string): Promise<boolean> {
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

        // Supprimer l'OTP après vérification réussie
        this.otpStorage.delete(phoneNumber);
        return true;
    }

    async resendOtp(phoneNumber: string): Promise<string> {
        // Supprimer l'ancien OTP s'il existe
        this.otpStorage.delete(phoneNumber);
        
        // Générer et envoyer un nouveau OTP
        return await this.sendOtp(phoneNumber);
    }
}