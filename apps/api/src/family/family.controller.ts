import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FamilyService } from './family.service';

@Controller('family')
@UseGuards(JwtAuthGuard)
export class FamilyController {
  constructor(private familyService: FamilyService) {}

  @Post('vincular')
  async vincular(@Req() req: any, @Body() data: { email: string; tipo: string }) {
    return this.familyService.vincular(req.user.sub, data.email, data.tipo);
  }

  @Get('dependentes')
  async dependentes(@Req() req: any) {
    return this.familyService.getDependentes(req.user.sub);
  }

  @Get('resumo')
  async resumo(@Req() req: any) {
    return this.familyService.getResumoFamiliar(req.user.sub);
  }
}
