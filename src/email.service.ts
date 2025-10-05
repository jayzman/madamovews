import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { mailParams } from './types';

interface mail {
  password?: string;
  email?: string;
  firstName?: string;
}

interface link {
  link: string
}

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) { }

  async sendMailVerification(params: mailParams, info: link) {
    try {
        console.log(await this.mailerService.verifyAllTransporters())
      await this.mailerService.sendMail({
        to: params.to,
        subject: params.subject,
        template: params.template,
        context: {
          link: info.link,
        },
      });
    } catch (error) {
        console.log(error);
    }
  }


  async sendEmail(params: mailParams, context: Record<string, any>) {
    console.log("================",  params.to, params.cc);
    try {
      await this.mailerService.sendMail({
        to: params.to,
        cc: params.cc,
        subject: params.subject,
        template: params.template,
        context
      });
    } catch (error) {
      console.log(error);
    }
  }
}
