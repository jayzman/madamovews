import { SmsService, SendSmsDto } from '../sms.service';
export declare class SmsController {
    private readonly smsService;
    constructor(smsService: SmsService);
    sendCustomSms(sendSmsDto: SendSmsDto): Promise<{
        success: boolean;
        results: any[];
    }>;
    sendOtp(phoneNumber: string): Promise<{
        message: string;
        phoneNumber: string;
    }>;
    verifyOtp(phoneNumber: string, otp: string): Promise<{
        message: string;
        valid: boolean;
    }>;
    resendOtp(phoneNumber: string): Promise<{
        message: string;
        phoneNumber: string;
    }>;
}
