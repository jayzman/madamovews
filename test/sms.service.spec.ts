import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SmsService } from '../src/sms.service';

describe('SmsService', () => {
  let service: SmsService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [SmsService, ConfigService],
    }).compile();

    service = module.get<SmsService>(SmsService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a 6-digit OTP', () => {
    const otp = service.generateOtp();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it('should store and verify OTP correctly', async () => {
    const phoneNumber = '+33123456789';
    
    // Mock sendSms to avoid actual SMS sending in tests
    jest.spyOn(service, 'sendSms').mockResolvedValue();
    
    // Send OTP
    const otp = await service.sendOtp(phoneNumber);
    expect(otp).toMatch(/^\d{6}$/);
    
    // Verify correct OTP
    const isValid = await service.verifyOtp(phoneNumber, otp);
    expect(isValid).toBe(true);
  });

  it('should reject invalid OTP', async () => {
    const phoneNumber = '+33123456789';
    
    // Mock sendSms
    jest.spyOn(service, 'sendSms').mockResolvedValue();
    
    // Send OTP
    await service.sendOtp(phoneNumber);
    
    // Try to verify with wrong OTP
    await expect(service.verifyOtp(phoneNumber, '000000')).rejects.toThrow('Code OTP incorrect');
  });

  it('should reject expired OTP', async () => {
    const phoneNumber = '+33123456789';
    
    // Mock sendSms
    jest.spyOn(service, 'sendSms').mockResolvedValue();
    
    // Send OTP
    const otp = await service.sendOtp(phoneNumber);
    
    // Manually set expiration to past
    const otpData = service['otpStorage'].get(phoneNumber);
    if (otpData) {
      otpData.expiresAt = new Date(Date.now() - 1000); // 1 second ago
    }
    
    // Try to verify expired OTP
    await expect(service.verifyOtp(phoneNumber, otp)).rejects.toThrow('Le code OTP a expiré');
  });

  // This test will only run if Twilio credentials are properly configured
  describe('Twilio Integration', () => {
    it('should have Twilio credentials configured', () => {
      const accountSid = configService.get('TWILIO_ACCOUNT_SID');
      const authToken = configService.get('TWILIO_AUTH_TOKEN');
      const phoneNumber = configService.get('TWILIO_PHONE_NUMBER');
      
      expect(accountSid).toBeDefined();
      expect(authToken).toBeDefined();
      expect(phoneNumber).toBeDefined();
    });
  });
});
