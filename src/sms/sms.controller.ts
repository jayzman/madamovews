import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SmsService, SendSmsDto } from '../sms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('sms')
@Controller('sms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  @ApiOperation({ summary: 'Envoyer un SMS personnalisé à un ou plusieurs destinataires' })
  @ApiResponse({ status: 200, description: 'SMS envoyé avec succès' })
  @ApiResponse({ status: 400, description: 'Erreur lors de l\'envoi du SMS' })
  async sendCustomSms(@Body() sendSmsDto: SendSmsDto) {
    return await this.smsService.sendCustomSms(sendSmsDto);
  }

  @Post('send-otp')
  @ApiOperation({ summary: 'Envoyer un code OTP à un numéro de téléphone' })
  @ApiResponse({ status: 200, description: 'Code OTP envoyé avec succès' })
  @ApiResponse({ status: 400, description: 'Erreur lors de l\'envoi de l\'OTP' })
  async sendOtp(@Body('phoneNumber') phoneNumber: string) {
    const otp = await this.smsService.sendOtp(phoneNumber);
    return {
      message: 'Code OTP envoyé avec succès',
      phoneNumber,
    };
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Vérifier un code OTP' })
  @ApiResponse({ status: 200, description: 'Code OTP vérifié avec succès' })
  @ApiResponse({ status: 400, description: 'Code OTP invalide ou expiré' })
  async verifyOtp(
    @Body('phoneNumber') phoneNumber: string,
    @Body('otp') otp: string
  ) {
    const isValid = await this.smsService.verifyOtp(phoneNumber, otp);
    return {
      message: 'Code OTP vérifié avec succès',
      valid: isValid,
    };
  }

  @Post('resend-otp')
  @ApiOperation({ summary: 'Renvoyer un code OTP' })
  @ApiResponse({ status: 200, description: 'Nouveau code OTP envoyé' })
  @ApiResponse({ status: 400, description: 'Erreur lors du renvoi de l\'OTP' })
  async resendOtp(@Body('phoneNumber') phoneNumber: string) {
    await this.smsService.resendOtp(phoneNumber);
    return {
      message: 'Nouveau code OTP envoyé avec succès',
      phoneNumber,
    };
  }
}
