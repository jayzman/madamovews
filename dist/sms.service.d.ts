import { ConfigService } from '@nestjs/config';
export interface SendSmsDto {
    to: string | string[];
    message: string;
}
export interface OtpData {
    phoneNumber: string;
    otp: string;
    expiresAt: Date;
}
export declare class SmsService {
    private readonly configService;
    private twilioClient;
    private otpStorage;
    constructor(configService: ConfigService);
    sendSms(to: string, body: string): Promise<void>;
    sendCustomSms(sendSmsDto: SendSmsDto): Promise<{
        success: boolean;
        results: any[];
    }>;
    generateOtp(): string;
    sendOtp(phoneNumber: string): Promise<string>;
    verifyOtp(phoneNumber: string, providedOtp: string): Promise<boolean>;
    resendOtp(phoneNumber: string): Promise<string>;
}
