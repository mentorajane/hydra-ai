import { Injectable } from '@nestjs/common';
import { prisma } from '../common/prisma';

@Injectable()
export class WeatherService {
  async getClima(cidade: string) {
    // Integração com API gratuita de clima (OpenWeatherMap, WeatherAPI, etc.)
    // Placeholder: retorna dados simulados
    return {
      cidade,
      temperatura: 28,
      umidade: 65,
      descricao: 'Céu claro',
    };
  }

  async atualizarMetaPorClima(usuarioId: string) {
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (! usuario) return null;

    const clima = await this.getClima(usuario.cidade);

    if (clima.temperatura > 25) {
      // GoalsService recalcula com a temperatura
      const { GoalsService } = await import('../goals/goals.service');
      // Isso seria injetado, mas para simplicidade o controller chama o goals
    }

    return clima;
  }
}
