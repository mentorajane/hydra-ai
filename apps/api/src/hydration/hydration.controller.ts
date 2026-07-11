import { Controller, Post, Get, Body, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HydrationService } from './hydration.service';

@Controller('hydration')
@UseGuards(JwtAuthGuard)
export class HydrationController {
  constructor(private hydrationService: HydrationService) {}

  @Post('registrar')
  async registrar(@Req() req: any, @Body() data: { quantidade_ml: number; origem?: string }) {
    return this.hydrationService.registrar(req.user.sub, data.quantidade_ml, data.origem);
  }

  @Get('hoje')
  async hoje(@Req() req: any) {
    return this.hydrationService.hoje(req.user.sub);
  }

  @Get('historico')
  async historico(@Req() req: any, @Query('dias') dias?: string) {
    return this.hydrationService.historico(req.user.sub, dias ? parseInt(dias) : 30);
  }

  @Post('camera')
  async camera(@Req() req: any, @Body() data: { imagem: string }) {
    return this.hydrationService.registrarCamera(req.user.sub, data.imagem);
  }
}
