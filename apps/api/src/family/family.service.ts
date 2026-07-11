import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@hydra/database';

@Injectable()
export class FamilyService {
  async vincular(usuarioId: string, emailDependente: string, tipo: string) {
    const dependente = await prisma.usuario.findUnique({
      where: { email: emailDependente },
    });
    if (! dependente) throw new NotFoundException('Usuário não encontrado');

    const relacao = await prisma.relacaoFamiliar.create({
      data: {
        responsavel_id: usuarioId,
        dependente_id: dependente.id,
        tipo,
      },
    });

    return relacao;
  }

  async getDependentes(usuarioId: string) {
    return prisma.relacaoFamiliar.findMany({
      where: { responsavel_id: usuarioId },
      include: {
        dependente: {
          select: {
            id: true,
            nome: true,
            idade: true,
          },
        },
      },
    });
  }

  async getResponsaveis(usuarioId: string) {
    return prisma.relacaoFamiliar.findMany({
      where: { dependente_id: usuarioId },
      include: {
        responsavel: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  }

  async getResumoFamiliar(usuarioId: string) {
    const dependentes = await this.getDependentes(usuarioId);
    const resumo: { nome: string; total_ml: number; meta_ml: number }[] = [];

    for (const rel of dependentes) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const totalHoje = await prisma.registroHidratacao.aggregate({
        where: {
          usuario_id: rel.dependente.id,
          data_hora: { gte: hoje },
        },
        _sum: { quantidade_ml: true },
      });

      const meta = await prisma.metaHidratacao.findFirst({
        where: { usuario_id: rel.dependente.id, ativa: true },
      });

      resumo.push({
        nome: rel.dependente.nome,
        total_ml: totalHoje._sum.quantidade_ml || 0,
        meta_ml: meta?.meta_ml || 0,
      });
    }

    return resumo;
  }
}
