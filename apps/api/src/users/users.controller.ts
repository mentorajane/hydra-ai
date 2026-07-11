import { Controller, Put, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Put('perfil')
  async updatePerfil(@Req() req: any, @Body() data: any) {
    return this.usersService.update(req.user.sub, data);
  }

  @Patch('preferencias')
  async updatePreferencias(@Req() req: any, @Body() data: any) {
    return this.usersService.updatePreferences(req.user.sub, data);
  }

  @Patch('modo-idoso')
  async toggleModoIdoso(@Req() req: any) {
    return this.usersService.toggleModoIdoso(req.user.sub);
  }
}
