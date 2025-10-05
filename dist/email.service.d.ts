import { MailerService } from '@nestjs-modules/mailer';
import { mailParams } from './types';
interface link {
    link: string;
}
export declare class MailService {
    private mailerService;
    constructor(mailerService: MailerService);
    sendMailVerification(params: mailParams, info: link): Promise<void>;
    sendEmail(params: mailParams, context: Record<string, any>): Promise<void>;
}
export {};
