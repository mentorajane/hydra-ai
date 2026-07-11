import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('semanal')
  async semanal(@Req() req: any) {
    return this.reportsService.semanal(req.user.sub);
  }

  @Get('mensal')
  async mensal(@Req() req: any) {
    return this.reportsService.mensal(req.user.sub);
  }

  @Get('personalizado')
  async personalizado(
    @Req() req: any,
    @Query('inicio') inicio: string,
    @Query('fim') fim: string,
  ) {
    return this.reportsService.personalizado(req.user.sub, inicio, fim);
  }
}
