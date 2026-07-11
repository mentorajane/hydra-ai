import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { prisma } from '@hydra/database';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
  private groq: Groq;

  constructor(private configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

  async getAprendizado(usuarioId: string) {
    let aprendizado = await prisma.aprendizadoIA.findUnique({
      where: { usuario_id: usuarioId },
    });

    if (! aprendizado) {
      aprendizado = await prisma.aprendizadoIA.create({
        data: {
          usuario_id: usuarioId,
          horarios_preferidos: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
          frequencia_ideal_minutos: 90,
          taxa_resposta: 0,
          horarios_ignorados: [],
          manha_ml: 0,
          tarde_ml: 0,
          noite_ml: 0,
        },
      });
    }

    return aprendizado;
  }

  async aprender(usuarioId: string) {
    const aprendizado = await this.getAprendizado(usuarioId);
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (! usuario) throw new NotFoundException();

    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const notificacoes = await prisma.notificacao.findMany({
      where: {
        usuario_id: usuarioId,
        criada_em: { gte: seteDiasAtras },
        tipo: 'LEMBRETE',
      },
      orderBy: { criada_em: 'asc' },
    });

    const horariosConfirmados: string[] = [];
    const horariosIgnorados: string[] = [];

    for (const n of notificacoes) {
      if (n.status === 'CONFIRMADA') horariosConfirmados.push(n.horario_agendado);
      else if (n.status === 'IGNORADA') horariosIgnorados.push(n.horario_agendado);
    }

    const totalRespondidas = horariosConfirmados.length + horariosIgnorados.length;
    const taxaResposta = totalRespondidas > 0
      ? horariosConfirmados.length / totalRespondidas
      : 0;

    let frequenciaIdeal = 90;
    if (taxaResposta < 0.3) {
      frequenciaIdeal = 120;
    } else if (taxaResposta > 0.7) {
      frequenciaIdeal = 60;
    }

    const registros = await prisma.registroHidratacao.findMany({
      where: {
        usuario_id: usuarioId,
        data_hora: { gte: seteDiasAtras },
      },
    });

    let manhaMl = 0, tardeMl = 0, noiteMl = 0;

    for (const r of registros) {
      const hora = r.data_hora.getHours();
      if (hora < 12) manhaMl += r.quantidade_ml;
      else if (hora < 18) tardeMl += r.quantidade_ml;
      else noiteMl += r.quantidade_ml;
    }

    const periodos = [
      { nome: 'manha', ml: manhaMl },
      { nome: 'tarde', ml: tardeMl },
      { nome: 'noite', ml: noiteMl },
    ];
    const horarioPico = periodos.reduce((max, p) => p.ml > max.ml ? p : max).nome;
    const horarioMenor = periodos.reduce((min, p) => p.ml < min.ml ? p : min).nome;

    const horariosPreferidos = this.gerarHorariosInteligentes(
      usuario.horario_acorda,
      usuario.horario_dorme,
      frequenciaIdeal,
      horariosConfirmados,
      horariosIgnorados,
    );

    const atualizado = await prisma.aprendizadoIA.update({
      where: { usuario_id: usuarioId },
      data: {
        horarios_preferidos: horariosPreferidos,
        frequencia_ideal_minutos: frequenciaIdeal,
        taxa_resposta: Math.round(taxaResposta * 100) / 100,
        horarios_ignorados: [...new Set([...aprendizado.horarios_ignorados, ...horariosIgnorados])],
        manha_ml: manhaMl,
        tarde_ml: tardeMl,
        noite_ml: noiteMl,
        horario_pico: horarioPico,
        horario_menor: horarioMenor,
        ultima_atualizacao: new Date(),
      },
    });

    return atualizado;
  }

  private gerarHorariosInteligentes(
    acorda: string,
    dorme: string,
    frequenciaMinutos: number,
    confirmados: string[],
    ignorados: string[],
  ): string[] {
    const [hAc, mAc] = acorda.split(':').map(Number);
    const [hDm, mDm] = dorme.split(':').map(Number);
    let minutosInicio = hAc * 60 + mAc;
    let minutosFim = hDm * 60 + mDm;
    if (minutosFim <= minutosInicio) minutosFim += 1440;

    const horarios: string[] = [];
    let atual = minutosInicio;

    const ignoradosMinutos = new Set(
      ignorados.map(h => {
        const [hi, mi] = h.split(':').map(Number);
        return hi * 60 + mi;
      }),
    );

    while (atual < minutosFim) {
      const horaStr = `${String(Math.floor(atual / 60) % 24).padStart(2, '0')}:${String(atual % 60).padStart(2, '0')}`;

      const proximoIgnorado = Array.from(ignoradosMinutos).some(
        (im) => Math.abs(atual - im) < 10,
      );

      if (! proximoIgnorado) {
        horarios.push(horaStr);
      }

      atual += frequenciaMinutos;
    }

    for (const h of confirmados) {
      if (! horarios.includes(h)) {
        horarios.push(h);
      }
    }

    return horarios.sort();
  }

  async reconhecerVolume(imagemBase64: string): Promise<{ volume_ml: number; confianca: number }> {
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Estime o volume de água neste copo ou garrafa em ml. Responda APENAS com um número inteiro entre 0 e 2000. Não escreva nada além do número.',
              },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imagemBase64}` },
              },
            ],
          },
        ],
        model: 'llama-3.2-11b-vision-preview',
        temperature: 0.1,
        max_tokens: 10,
      });

      const texto = completion.choices[0]?.message?.content?.trim() || '0';
      const volume = parseInt(texto.replace(/[^0-9]/g, ''), 10);
      const volumeValido = isNaN(volume) || volume < 0 ? 0 : Math.min(volume, 2000);

      return { volume_ml: volumeValido, confianca: volumeValido > 0 ? 0.8 : 0 };
    } catch (error: any) {
      console.error('Erro ao reconhecer volume:', error.message);
      return { volume_ml: 200, confianca: 0.3 };
    }
  }

  async conversar(mensagem: string, contexto?: { peso?: number; idade?: number; cidade?: string; temperatura?: number }) {
    try {
      const systemPrompt = `Você é o Hydra AI, um assistente especializado em hidratação e saúde.

REGRAS:
- Baseie suas respostas em evidências científicas (Institute of Medicine, EFSA, OMS, Sociedade Brasileira de Nefrologia).
- NUNCA forneça diagnósticos ou prescrições médicas.
- SEMPRE inclua o aviso: "Esta informação não substitui orientação médica profissional."
- Seja gentil, direto e use linguagem simples.
- Responda em português do Brasil.
- Se não souber a resposta, diga que não pode responder e recomende um médico.

Se o usuário perguntar sobre quantidade de água, a recomendação geral é 35ml por kg de peso, ajustado por:
- Atividade física (+5 a +20ml/kg)
- Clima quente (+100ml a cada 5°C acima de 25°C)
- Gestação (+300ml/dia)
- Amamentação (+700ml/dia)
- Diabetes (+500ml/dia)
- Medicamentos diuréticos (+300ml/dia)
- Idade > 60 anos (redução de 10%)
- Idade > 70 anos (redução de 15%)`;

      const userContext = contexto
        ? `Contexto do usuário: peso ${contexto.peso}kg, idade ${contexto.idade}, cidade ${contexto.cidade}${contexto.temperatura ? `, temperatura ${contexto.temperatura}°C` : ''}.\n\n`
        : '';

      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${userContext}${mensagem}` },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 1024,
      });

      const resposta = completion.choices[0]?.message?.content || 'Não foi possível processar sua pergunta.';

      return {
        resposta,
        modelo: 'llama-3.3-70b (Groq)',
        aviso: 'Esta informação não substitui orientação médica profissional.',
      };
    } catch (error: any) {
      console.error('Erro Groq:', error.message);

      if (error.status === 401) {
        return {
          resposta: 'A chave de API da IA não está configurada corretamente. Entre em contato com o suporte.',
          aviso: 'Serviço de IA temporariamente indisponível.',
          erro: 'API_KEY_INVALIDA',
        };
      }

      return {
        resposta: 'Desculpe, o serviço de IA está temporariamente indisponível. Tente novamente mais tarde.',
        aviso: 'Esta informação não substitui orientação médica profissional.',
        erro: 'SERVICO_INDISPONIVEL',
      };
    }
  }
}
