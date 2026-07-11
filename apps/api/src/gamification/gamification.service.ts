import { Injectable } from '@nestjs/common';
import { prisma } from '../common/prisma';

@Injectable()
export class GamificationService {
  async getStatus(usuarioId: string) {
    let game = await prisma.gamificacao.findUnique({
      where: { usuario_id: usuarioId },
    });

    if (! game) {
      game = await prisma.gamificacao.create({
        data: { usuario_id: usuarioId },
      });
    }

    return game;
  }

  async addXp(usuarioId: string, xpGanho: number) {
    const game = await this.getStatus(usuarioId);
    const novoXp = game.xp + xpGanho;
    const novoNivel = Math.floor(novoXp / 100) + 1;

    const updated = await prisma.gamificacao.update({
      where: { usuario_id: usuarioId },
      data: {
        xp: novoXp,
        nivel: novoNivel,
      },
    });

    return updated;
  }

  async verificarConquistas(usuarioId: string) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    const trintaDiasAtras = new Date(hoje);
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

    // Verificar 7 dias hidratado
    const ultimos7Dias = await prisma.registroHidratacao.findMany({
      where: {
        usuario_id: usuarioId,
        data_hora: { gte: seteDiasAtras },
      },
    });

    // Contar dias com registro
    const diasComRegistro = new Set(
      ultimos7Dias.map(r => r.data_hora.toISOString().split('T')[0]),
    );

    const conquistas: string[] = [];

    if (diasComRegistro.size >= 7) {
      conquistas.push('DIAS_7');
    }
    if (diasComRegistro.size >= 30) {
      conquistas.push('DIAS_30');
    }

    // Verificar 100 litros
    const totalLitros = (await prisma.registroHidratacao.aggregate({
      where: { usuario_id: usuarioId },
      _sum: { quantidade_ml: true },
    }))._sum.quantidade_ml || 0;

    if (totalLitros >= 100000) {
      conquistas.push('LITROS_100');
    }

    // Criar conquistas
    for (const tipo of conquistas) {
      const conquista = await prisma.conquista.findUnique({ where: { tipo: tipo as any } });
      if (conquista) {
        await prisma.conquistaUsuario.upsert({
          where: {
            usuario_id_conquista_id: {
              usuario_id: usuarioId,
              conquista_id: conquista.id,
            },
          },
          update: {},
          create: {
            usuario_id: usuarioId,
            conquista_id: conquista.id,
          },
        });
      }
    }

    return conquistas;
  }
}
