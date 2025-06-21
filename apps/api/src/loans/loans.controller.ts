import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { LoansService, AmortizationScheduleEntry } from './loans.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get(':loanId/amortization-schedule')
  async getAmortizationSchedule(
    @Param('loanId', ParseUUIDPipe) loanId: string,
  ): Promise<AmortizationScheduleEntry[]> {
    return this.loansService.getAmortizationSchedule(loanId);
  }
} 