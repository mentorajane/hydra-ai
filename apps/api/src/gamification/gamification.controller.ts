import { Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GamificationService } from './gamification.service';

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private gamificationService: GamificationService) {}

  @Get()
  async status(@Req() req: any) {
    return this.gamificationService.getStatus(req.user.sub);
  }

  @Post('verificar-conquistas')
  async verificarConquistas(@Req() req: any) {
    return this.gamificationService.verificarConquistas(req.user.sub);
  }
}
