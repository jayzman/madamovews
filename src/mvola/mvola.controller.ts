import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { MvolaPaymentService } from './mvola-payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@Controller('mvola')
@ApiTags('mvola')
@ApiBearerAuth()
export class MvolaController {
  constructor(private readonly mvolaService: MvolaPaymentService) {}

  /**
   * 💳 Initier un paiement client -> marchand
   */
  @Post('pay')
  @ApiOperation({ summary: 'Initier un paiement MVola MerchantPay' })
  async initiatePayment(@Body() dto: CreatePaymentDto) {
    return this.mvolaService.initiatePayment(dto.customerMsisdn, dto.amount, dto.description);
  }

  /**
   * 🔁 Callback MVola (appelé automatiquement par MVola)
   */
  @Post('callback')
  @ApiOperation({ summary: 'Callback reçu de MVola après une transaction' })
  async handleCallback(@Body() data: any) {
    return this.mvolaService.handleCallback(data);
  }

  /**
   * 🔍 Détails d'une transaction MVola
   * Exemple : GET /mvola/details/123456789
   */
  @Get('details/:transactionId')
  @ApiOperation({ summary: 'Récupérer les détails d’une transaction MVola' })
  @ApiParam({ name: 'transactionId', description: 'ID de la transaction MVola' })
  async getTransactionDetails(@Param('transactionId') transactionId: string) {
    return this.mvolaService.getTransactionDetails(transactionId);
  }

  /**
   * 📊 Statut d'une transaction (via serverCorrelationId)
   * Exemple : GET /mvola/status/abcd-efgh-1234
   */
  @Get('status/:serverCorrelationId')
  @ApiOperation({ summary: 'Récupérer le statut d’une transaction en attente' })
  @ApiParam({ name: 'serverCorrelationId', description: 'Identifiant de corrélation MVola' })
  async getTransactionStatus(@Param('serverCorrelationId') serverCorrelationId: string) {
    return this.mvolaService.getTransactionStatus(serverCorrelationId);
  }
}
