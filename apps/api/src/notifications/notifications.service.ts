import { Injectable } from '@nestjs/common';
import { prisma } from '@hydra/database';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class NotificationsService {
  async getNotificacoes(usuarioId: string, data?: string) {
    const filtroData = data ? new Date(data) : new Date();
    const inicio = new Date(filtroData);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + 1);

    return prisma.notificacao.findMany({
      where: {
        usuario_id: usuarioId,
        criada_em: { gte: inicio, lt: fim },
      },
      orderBy: { horario_agendado: 'asc' },
    });
  }

  async criarNotificacoesDoDia(usuarioId: string) {
    const aprendizado = await prisma.aprendizadoIA.findUnique({
      where: { usuario_id: usuarioId },
    });

    const horarios = aprendizado?.horarios_preferidos ?? [
      '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00',
    ];

    const agora = new Date();
    const inicioDia = new Date(agora);
    inicioDia.setHours(0, 0, 0, 0);

    const notificacoes: any[] = [];
    for (const horario of horarios) {
      const [h, m] = horario.split(':').map(Number);

      const mensagem = await this.gerarMensagemInteligente(usuarioId, horario);

      const notificacao = await prisma.notificacao.create({
        data: {
          usuario_id: usuarioId,
          tipo: 'LEMBRETE',
          mensagem,
          horario_agendado: horario,
          data_agendada: new Date(inicioDia.getFullYear(), inicioDia.getMonth(), inicioDia.getDate(), h, m, 0),
        },
      });
      notificacoes.push(notificacao);
    }

    return notificacoes;
  }

  async confirmar(notificacaoId: string) {
    return prisma.notificacao.update({
      where: { id: notificacaoId },
      data: {
        status: 'CONFIRMADA',
        confirmada_em: new Date(),
      },
    });
  }

  async ignorar(notificacaoId: string) {
    return prisma.notificacao.update({
      where: { id: notificacaoId },
      data: {
        status: 'IGNORADA',
      },
    });
  }

  // Executa a cada 30 minutos para verificar notificações pendentes
  @Cron('*/30 * * * *')
  async verificarNotificacoesPendentes() {
    const agora = new Date();
    const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

    const pendentes = await prisma.notificacao.findMany({
      where: {
        horario_agendado: horaAtual,
        status: 'PENDENTE',
        data_agendada: {
          gte: new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0),
          lt: new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1, 0, 0, 0),
        },
      },
      include: { usuario: true },
    });

    for (const n of pendentes) {
      await prisma.notificacao.update({
        where: { id: n.id },
        data: {
          status: 'ENVIADA',
          enviada_em: new Date(),
        },
      });
      // Aqui seria integrado com Firebase Cloud Messaging
      console.log(`[PUSH] Notificação para ${n.usuario.email}: ${n.mensagem}`);
    }
  }

  private async gerarMensagemInteligente(usuarioId: string, horario: string): Promise<string> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Verifica há quanto tempo não bebe
    const ultimoRegistro = await prisma.registroHidratacao.findFirst({
      where: { usuario_id: usuarioId },
      orderBy: { data_hora: 'desc' },
    });

    const aprendizado = await prisma.aprendizadoIA.findUnique({
      where: { usuario_id: usuarioId },
    });

    let mensagem = `💧 Hora de beber água!`;

    if (ultimoRegistro) {
      const horasDesdeUltimo = (Date.now() - ultimoRegistro.data_hora.getTime()) / 3600000;
      if (horasDesdeUltimo >= 2) {
        mensagem = `⚠️ Você está há ${Math.floor(horasDesdeUltimo)} horas sem beber água. Seu corpo pode estar perdendo desempenho.`;
      }
    }

    // Se o usuário tem baixa taxa de resposta de manhã, mensagem mais urgente
    if (aprendizado && aprendizado.horario_menor === 'manha' && parseInt(horario) < 12) {
      mensagem = `🌅 Bom dia! Comece o dia hidratado. Seu cérebro funciona melhor com água.`;
    }

    return mensagem;
  }
}
