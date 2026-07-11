import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../common/prisma';
import { NivelAtividade, RECOMENDACOES_BASE, POR_KG_ATIVIDADE } from '../common/types';

@Injectable()
export class GoalsService {
  async calcularMeta(usuarioId: string, temperatura?: number) {
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (! usuario) throw new NotFoundException('Usuário não encontrado');

    // Base: 35ml por kg (IOM + EFSA)
    const mlPorKg = POR_KG_ATIVIDADE[usuario.atividade_fisica as NivelAtividade] || 35;
    let metaBase = usuario.peso * mlPorKg;

    // Ajuste por idade
    if (usuario.idade >= 70) metaBase *= RECOMENDACOES_BASE.FATOR_IDADE_70_MAIS;
    else if (usuario.idade >= 60) metaBase *= RECOMENDACOES_BASE.FATOR_IDADE_60_MAIS;

    // Ajuste gestante
    const ajusteGestacao = usuario.gestante ? RECOMENDACOES_BASE.GESTANTE_ADICIONAL_ML : 0;

    // Ajuste amamentação
    const ajusteAmamentacao = usuario.amamentando ? RECOMENDACOES_BASE.AMAMENTACAO_ADICIONAL_ML : 0;

    // Ajuste diabetes
    const ajusteDiabetes = usuario.diabetes ? RECOMENDACOES_BASE.DIABETES_ADICIONAL_ML : 0;

    // Ajuste diuréticos
    const ajusteDiureticos = usuario.medicamentos_diureticos ? RECOMENDACOES_BASE.DIURETICO_ADICIONAL_ML : 0;

    // Ajuste clima: +100ml a cada 5°C acima de 25°C
    let ajusteClima = 0;
    if (temperatura && temperatura > 25) {
      ajusteClima = Math.floor(((temperatura - 25) / 5) * 100);
    }

    // Ajuste trabalho sentado: lembretes mais frequentes
    // Não adiciona ml, mas ajusta frequência

    const totalMeta = Math.round(metaBase + ajusteGestacao + ajusteAmamentacao + ajusteDiabetes + ajusteDiureticos + ajusteClima);

    // Calcular número de lembretes e intervalos
    const horasAcordado = this.calcularHorasAcordado(usuario.horario_acorda, usuario.horario_dorme);
    const numeroLembretes = Math.max(4, Math.floor(horasAcordado / 1.5)); // um a cada ~1.5h
    const intervalosMinutos = Math.floor(horasAcordado * 60 / numeroLembretes);
    const quantidadePorGole = Math.max(150, Math.min(300, Math.round(totalMeta / numeroLembretes)));

    // Desativar meta anterior
    await prisma.metaHidratacao.updateMany({
      where: { usuario_id: usuarioId, ativa: true },
      data: { ativa: false },
    });

    // Criar nova meta
    const meta = await prisma.metaHidratacao.create({
      data: {
        usuario_id: usuarioId,
        meta_ml: totalMeta,
        meta_ml_por_kg: mlPorKg,
        quantidade_por_gole_ml: quantidadePorGole,
        numero_lembretes: numeroLembretes,
        intervalos_minutos: intervalosMinutos,
        ajuste_clima_ml: ajusteClima,
        ajuste_atividade_ml: (mlPorKg - 35) * usuario.peso,
        ajuste_gestacao_ml: ajusteGestacao,
        ajuste_amamentacao_ml: ajusteAmamentacao,
        ajuste_doenca_ml: ajusteDiabetes + ajusteDiureticos,
        temperatura_atual: temperatura ?? null,
        ativa: true,
      },
    });

    return meta;
  }

  async metaAtual(usuarioId: string) {
    const meta = await prisma.metaHidratacao.findFirst({
      where: { usuario_id: usuarioId, ativa: true },
      orderBy: { calculada_em: 'desc' },
    });
    return meta;
  }

  async recalcularSeNecessario(usuarioId: string, temperatura?: number) {
    const metaAtual = await this.metaAtual(usuarioId);
    if (! metaAtual) return this.calcularMeta(usuarioId, temperatura);

    // Recalcula se a meta foi criada há mais de 24h
    const horasDesdeCriacao = (Date.now() - metaAtual.calculada_em.getTime()) / 3600000;
    if (horasDesdeCriacao > 24) {
      return this.calcularMeta(usuarioId, temperatura);
    }

    return metaAtual;
  }

  private calcularHorasAcordado(acorda: string, dorme: string): number {
    const [hAcorda, mAcorda] = acorda.split(':').map(Number);
    const [hDorme, mDorme] = dorme.split(':').map(Number);
    let horas = hDorme - hAcorda + (mDorme - mAcorda) / 60;
    if (horas <= 0) horas += 24;
    return horas;
  }
}
