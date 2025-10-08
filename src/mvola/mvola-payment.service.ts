import { Injectable, Inject, forwardRef, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MvolaAuthService } from './mvola-auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class MvolaPaymentService {
  private baseUrl = process.env.MVOLA_BASE_URL;
  private readonly version = process.env.MVOLA_API_VERSION || '1.0';    
  private partnerMsisdn = process.env.MVOLA_PARTNER_MSISDN;
  private partnerName = process.env.MVOLA_PARTNER_NAME;

  constructor(
    private readonly http: HttpService,
    @Inject(forwardRef(() => MvolaAuthService))
    private readonly authService: MvolaAuthService,
    private readonly prisma: PrismaService,
  ) {}

  private getMvolaDate(): string {
    // Renvoie la date au format ISO standard avec millisecondes et 'Z'
    return new Date().toISOString(); // ex: "2025-10-08T12:59:03.076Z"
  }

  /** 💳 1. INITIATE TRANSACTION (POST) */
  async initiatePayment(customerMsisdn: string, amount: number, description: string) {
    try {
      const token = await this.authService.getAccessToken();
      const correlationId = randomUUID();
      const transactionRef = randomUUID();

      const body = {
        amount: String(amount.toFixed(0)),
        currency: 'Ar',
        descriptionText: description.slice(0, 50).replace(/[^A-Za-z0-9\s\-.,_]/g, ''),
        requestingOrganisationTransactionReference: transactionRef,
        requestDate: this.getMvolaDate(),
        originalTransactionReference: '',
        debitParty: [
          { key: 'msisdn', value: customerMsisdn.replace(/\s|\+261/g, '').trim() },
        ],
        creditParty: [
          { key: 'msisdn', value: this.partnerMsisdn.replace(/\s|\+261/g, '').trim() },
        ],
        metadata: [
          { key: 'partnerName', value: this.partnerName },
        ],
      };

      console.log('📤 Initiating MVola payment with body:\n', JSON.stringify(body, null, 2));

      const response = await firstValueFrom(
        this.http.post(
          `${this.baseUrl}/mvola/mm/transactions/type/merchantpay/1.0.0/`,
          body,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Version: this.version,
              UserLanguage: 'MG',
              'UserAccountIdentifier': `msisdn;${this.partnerMsisdn}`,
              partenrName: this.partnerName,
              'X-CorrelationID': correlationId,
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              //'X-Callback-URL': process.env.MVOLA_CALLBACK_URL,
            },
          },
        ),
      );

      const data = response.data;

      await this.prisma.payment.create({
        data: {
          customerMsisdn,
          amount,
          description,
          status: data.status || 'pending',
          serverCorrelationId: data.serverCorrelationId,
        },
      });

      return data;
    } catch (error) {
      console.error('Error initiating payment:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data || 'Failed to initiate payment',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /** 🔁 2. CALLBACK HANDLER */
  async handleCallback(callbackData: any) {
    const { serverCorrelationId, transactionStatus, transactionReference } = callbackData;
    console.log(`🔔 Payment status updated via callback: ${serverCorrelationId} -> ${transactionStatus}`);
    await this.prisma.payment.updateMany({
      where: { serverCorrelationId },
      data: {
        status: transactionStatus,
        transactionRef: transactionReference,
      },
    });

    return { updated: true };
  }

  /** 🔎 3. GET TRANSACTION DETAILS */
  async getTransactionDetails(transactionId: string) {
    const token = await this.authService.getAccessToken();
    const correlationId = randomUUID();

    const response = await firstValueFrom(
      this.http.get(
        `${this.baseUrl}/mvola/mm/transactions/type/merchantpay/1.0.0/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Version: this.version,
            'X-CorrelationID': correlationId,
            UserLanguage: 'MG',
            'UserAccountIdentifier': `msisdn;${this.partnerMsisdn}`,
            partnerName: this.partnerName,
            'Cache-Control': 'no-cache',
          },
        },
      ),
    );

    return response.data;
  }

  /** 📊 4. GET TRANSACTION STATUS */
  async getTransactionStatus(serverCorrelationId: string) {
    const token = await this.authService.getAccessToken();
    const correlationId = randomUUID();

    const response = await firstValueFrom(
      this.http.get(
        `${this.baseUrl}/mvola/mm/transactions/type/merchantpay/1.0.0/status/${serverCorrelationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Version: this.version,
            'X-CorrelationID': correlationId,
            UserLanguage: 'MG',
            'UserAccountIdentifier': `msisdn;${this.partnerMsisdn}`,
            partnerName: this.partnerName,
            'Cache-Control': 'no-cache',
          },
        },
      ),
    );
    const data = response.data;
    // ✅ Met à jour le paiement si le statut a changé
    if (data.status && data.status !== 'pending') {
        await this.prisma.payment.updateMany({
        where: { serverCorrelationId },
        data: {
            status: data.status,
            transactionRef: data.transactionReference,
        },
        });

        console.log(`✅ Payment ${serverCorrelationId} updated to status: ${data.status}`);
    }

    return data;
  }
}
