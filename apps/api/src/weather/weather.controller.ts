import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WeatherService } from './weather.service';

@Controller('weather')
@UseGuards(JwtAuthGuard)
export class WeatherController {
  constructor(private weatherService: WeatherService) {}

  @Get('atual')
  async atual(@Req() req: any) {
    return this.weatherService.atualizarMetaPorClima(req.user.sub);
  }
}
