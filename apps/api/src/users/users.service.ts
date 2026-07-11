import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@hydra/database';

@Injectable()
export class UsersService {
  async update(usuarioId: string, data: any) {
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (! usuario) throw new NotFoundException('Usuário não encontrado');

    const updated = await prisma.usuario.update({
      where: { id: usuarioId },
      data,
    });

    return updated;
  }

  async updatePreferences(usuarioId: string, data: any) {
    const prefs = await prisma.preferenciaUsuario.upsert({
      where: { usuario_id: usuarioId },
      update: data,
      create: { usuario_id: usuarioId, ...data },
    });
    return prefs;
  }

  async toggleModoIdoso(usuarioId: string) {
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (! usuario) throw new NotFoundException();
    return prisma.usuario.update({
      where: { id: usuarioId },
      data: { modo_idoso: ! usuario.modo_idoso },
    });
  }
}
