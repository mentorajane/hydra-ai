import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { prisma } from '@hydra/database';
import { AiService } from '../ai/ai.service';

@Injectable()
export class HydrationService {
  constructor(
    @Inject(forwardRef(() => AiService))
    private aiService: AiService,
  ) {}

  async registrar(usuarioId: string, quantidade_ml: number, origem = 'manual') {
    const registro = await prisma.registroHidratacao.create({
      data: { usuario_id: usuarioId, quantidade_ml, origem },
    });
    return registro;
  }

  async hoje(usuarioId: string) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const registros = await prisma.registroHidratacao.findMany({
      where: {
        usuario_id: usuarioId,
        data_hora: { gte: hoje, lt: amanha },
      },
      orderBy: { data_hora: 'asc' },
    });

    const total_ml = registros.reduce((sum, r) => sum + r.quantidade_ml, 0);

    const metaAtiva = await prisma.metaHidratacao.findFirst({
      where: { usuario_id: usuarioId, ativa: true },
      orderBy: { calculada_em: 'desc' },
    });

    return {
      registros,
      total_ml,
      meta_ml: metaAtiva?.meta_ml ?? 0,
      percentual: metaAtiva ? (total_ml / metaAtiva.meta_ml) * 100 : 0,
    };
  }

  async historico(usuarioId: string, dias = 30) {
    const data = new Date();
    data.setDate(data.getDate() - dias);
    data.setHours(0, 0, 0, 0);

    const registros = await prisma.registroHidratacao.findMany({
      where: {
        usuario_id: usuarioId,
        data_hora: { gte: data },
      },
      orderBy: { data_hora: 'asc' },
    });

    const diario: Record<string, number> = {};
    for (const r of registros) {
      const dia = r.data_hora.toISOString().split('T')[0];
      diario[dia] = (diario[dia] || 0) + r.quantidade_ml;
    }

    return Object.entries(diario).map(([data, total_ml]) => ({
      data,
      total_ml,
    }));
  }

  async registrarCamera(usuarioId: string, imagemBase64: string) {
    const { volume_ml, confianca } = await this.aiService.reconhecerVolume(imagemBase64);

    const registro = await prisma.registroHidratacao.create({
      data: {
        usuario_id: usuarioId,
        quantidade_ml: volume_ml,
        origem: 'camera',
      },
    });

    return {
      registro,
      volume_ml,
      confianca,
      aviso: confianca < 0.5
        ? 'Não foi possível reconhecer o volume com precisão. O valor pode estar incorreto.'
        : undefined,
    };
  }
}
