import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { CalculateEaseDto } from './dto/calculate-ease.dto';
import { CalculateYieldDto } from './dto/calculate-yield.dto';

@Controller('measurements')
export class MeasurementsController {
  constructor(private readonly service: MeasurementsService) {}

  @Get('templates')
  getTemplates(
    @Query('gender') gender?: string,
    @Query('category') category?: string
  ) {
    return this.service.getGarmentTemplates(gender, category);
  }

  @Post('calculate-ease')
  calculateEase(@Body() dto: CalculateEaseDto) {
    return this.service.calculateEase(dto);
  }

  @Post('fabric-yield')
  calculateYield(@Body() dto: CalculateYieldDto) {
    return this.service.calculateFabricYield(dto);
  }
}
