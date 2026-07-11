import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AiService } from './ai.service';
import { prisma } from '@hydra/database';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Get('aprendizado')
  @UseGuards(JwtAuthGuard)
  async getAprendizado(@Req() req: any) {
    return this.aiService.getAprendizado(req.user.sub);
  }

  @Post('aprender')
  @UseGuards(JwtAuthGuard)
  async aprender(@Req() req: any) {
    return this.aiService.aprender(req.user.sub);
  }

  @Post('conversar')
  async conversar(
    @Body() data: { mensagem: string; contexto?: { peso?: number; idade?: number; cidade?: string; temperatura?: number } },
  ) {
    return this.aiService.conversar(data.mensagem, data.contexto);
  }

  @Post('conversar-autenticado')
  @UseGuards(JwtAuthGuard)
  async conversarAutenticado(@Req() req: any, @Body() data: { mensagem: string }) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.sub },
      select: { peso: true, idade: true, cidade: true },
    });

    const contexto = usuario
      ? { peso: usuario.peso, idade: usuario.idade, cidade: usuario.cidade }
      : undefined;

    return this.aiService.conversar(data.mensagem, contexto);
  }
}
