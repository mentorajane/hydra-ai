import { Controller, Post, Get, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GoalsService } from './goals.service';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private goalsService: GoalsService) {}

  @Post('calcular')
  async calcular(@Req() req: any, @Query('temp') temperatura?: string) {
    return this.goalsService.calcularMeta(
      req.user.sub,
      temperatura ? parseFloat(temperatura) : undefined,
    );
  }

  @Get('atual')
  async atual(@Req() req: any) {
    return this.goalsService.metaAtual(req.user.sub);
  }

  @Post('recalcular')
  async recalcular(@Req() req: any, @Query('temp') temperatura?: string) {
    return this.goalsService.recalcularSeNecessario(
      req.user.sub,
      temperatura ? parseFloat(temperatura) : undefined,
    );
  }
}
