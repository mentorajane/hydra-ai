import { Injectable } from '@nestjs/common';
import { prisma } from '@hydra/database';

@Injectable()
export class ReportsService {
  async semanal(usuarioId: string) {
    const hoje = new Date();
    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    seteDiasAtras.setHours(0, 0, 0, 0);

    return this.gerarRelatorio(usuarioId, seteDiasAtras, hoje);
  }

  async mensal(usuarioId: string) {
    const hoje = new Date();
    const trintaDiasAtras = new Date(hoje);
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    trintaDiasAtras.setHours(0, 0, 0, 0);

    return this.gerarRelatorio(usuarioId, trintaDiasAtras, hoje);
  }

  async personalizado(usuarioId: string, inicio: string, fim: string) {
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    dataFim.setHours(23, 59, 59, 999);
    return this.gerarRelatorio(usuarioId, dataInicio, dataFim);
  }

  private async gerarRelatorio(usuarioId: string, inicio: Date, fim: Date) {
    const registros = await prisma.registroHidratacao.findMany({
      where: {
        usuario_id: usuarioId,
        data_hora: { gte: inicio, lte: fim },
      },
      orderBy: { data_hora: 'asc' },
    });

    // Agrupar por dia
    const diario: Record<string, { total_ml: number; registros: number }> = {};
    for (const r of registros) {
      const dia = r.data_hora.toISOString().split('T')[0];
      if (! diario[dia]) diario[dia] = { total_ml: 0, registros: 0 };
      diario[dia].total_ml += r.quantidade_ml;
      diario[dia].registros++;
    }

    const totalMl = registros.reduce((s, r) => s + r.quantidade_ml, 0);
    const mediaDiaria = Object.keys(diario).length > 0
      ? totalMl / Object.keys(diario).length
      : 0;

    // Análise de horários
    const horarios: Record<string, number> = {};
    for (const r of registros) {
      const hora = `${String(r.data_hora.getHours()).padStart(2, '0')}:00`;
      horarios[hora] = (horarios[hora] || 0) + r.quantidade_ml;
    }

    // Dias esquecidos (sem nenhum registro)
    const diasEsquecidos: string[] = [];
    const dataAtual = new Date(inicio);
    while (dataAtual <= fim) {
      const diaStr = dataAtual.toISOString().split('T')[0];
      if (! diario[diaStr]) diasEsquecidos.push(diaStr);
      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    // Correlação humor
    const humores = await prisma.registroHumor.findMany({
      where: {
        usuario_id: usuarioId,
        data: { gte: inicio, lte: fim },
      },
    });

    const humorMedio = humores.length > 0
      ? humores.reduce((s, h) => s + h.humor, 0) / humores.length
      : null;

    return {
      periodo: { inicio, fim },
      total_ml: totalMl,
      media_diaria_ml: Math.round(mediaDiaria),
      dias_com_registro: Object.keys(diario).length,
      dias_esquecidos: diasEsquecidos.length,
      dias_esquecidos_lista: diasEsquecidos,
      horarios_mais_frequentes: Object.entries(horarios)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([hora, ml]) => ({ hora, ml })),
      humor_medio: humorMedio ? Math.round(humorMedio * 10) / 10 : null,
      total_registros: registros.length,
    };
  }
}
