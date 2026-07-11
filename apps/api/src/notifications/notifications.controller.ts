import { Controller, Get, Post, Param, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async listar(@Req() req: any, @Query('data') data?: string) {
    return this.notificationsService.getNotificacoes(req.user.sub, data);
  }

  @Post('gerar-dia')
  async gerarDia(@Req() req: any) {
    return this.notificationsService.criarNotificacoesDoDia(req.user.sub);
  }

  @Post(':id/confirmar')
  async confirmar(@Param('id') id: string) {
    return this.notificationsService.confirmar(id);
  }

  @Post(':id/ignorar')
  async ignorar(@Param('id') id: string) {
    return this.notificationsService.ignorar(id);
  }
}
