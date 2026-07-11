import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { prisma } from '../common/prisma';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(data: {
    nome: string;
    email: string;
    senha: string;
    idade: number;
    sexo: 'MASCULINO' | 'FEMININO';
    peso: number;
    altura: number;
    cidade: string;
    atividade_fisica: string;
    horario_acorda: string;
    horario_dorme: string;
    gestante?: boolean;
    amamentando?: boolean;
    doenca_renal?: boolean;
    diabetes?: boolean;
    hipertensao?: boolean;
    medicamentos_diureticos?: boolean;
    trabalho_sentado?: boolean;
  }) {
    const existing = await prisma.usuario.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email já cadastrado');

    const senha_hash = await bcrypt.hash(data.senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha_hash,
        idade: data.idade,
        sexo: data.sexo,
        peso: data.peso,
        altura: data.altura,
        cidade: data.cidade,
        atividade_fisica: data.atividade_fisica as any,
        horario_acorda: data.horario_acorda,
        horario_dorme: data.horario_dorme,
        gestante: data.gestante ?? false,
        amamentando: data.amamentando ?? false,
        doenca_renal: data.doenca_renal ?? false,
        diabetes: data.diabetes ?? false,
        hipertensao: data.hipertensao ?? false,
        medicamentos_diureticos: data.medicamentos_diureticos ?? false,
        trabalho_sentado: data.trabalho_sentado ?? false,
      },
    });

    const token = this.jwtService.sign({ sub: usuario.id, email: usuario.email });

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    };
  }

  async login(email: string, senha: string) {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (! usuario) throw new UnauthorizedException('Credenciais inválidas');

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (! senhaValida) throw new UnauthorizedException('Credenciais inválidas');

    const token = this.jwtService.sign({ sub: usuario.id, email: usuario.email });

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    };
  }

  async me(usuarioId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        preferencias: true,
        gamificacao: true,
      },
    });
    return usuario;
  }
}
