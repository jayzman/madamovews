import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as qs from 'qs';

@Injectable()
export class MvolaAuthService {
  private baseUrl = process.env.MVOLA_BASE_URL;
  private consumerKey = process.env.MVOLA_CONSUMER_KEY;
  private consumerSecret = process.env.MVOLA_CONSUMER_SECRET;

  constructor(private readonly http: HttpService) {}

  async getAccessToken(): Promise<string> {
    const credentials = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');

    const body = qs.stringify({
      grant_type: 'client_credentials',
      scope: 'EXT_INT_MVOLA_SCOPE',
    });

    const response = await firstValueFrom(
      this.http.post(`${this.baseUrl}/token`, body, {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache',
        },
      }),
    );

    return response.data.access_token;
  }
}
