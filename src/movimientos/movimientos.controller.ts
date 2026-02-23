import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { CreateMovimientoDto, UpdateMovimientoDto } from './dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { PermisoGuard } from 'src/auth/guards/permiso.guard';
import { Permiso } from 'src/auth/decorators/permiso.decorator';

@UseGuards(JwtGuard, PermisoGuard)
@Controller('movimientos')
export class MovimientosController {
  constructor(private readonly movimientosService: MovimientosService) {}

  @Post()
  @Permiso(85)
  create(@Body() createMovimientoDto: CreateMovimientoDto) {
    return this.movimientosService.create(createMovimientoDto);
  }

  @Get()
  @Permiso(86)
  findAll() {
    return this.movimientosService.findAll();
  }

  @Get('reporte-mensual')
  getReporteMensual(@Query('mes') mes: string, @Query('anio') anio: string) {
    return this.movimientosService.getReporteMensual(+mes, +anio);
  }

  @Get('reporte-lote/:loteId')
  getReportePorLote(
    @Param('loteId') loteId: string,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
  ) {
    return this.movimientosService.getReportePorLote(
      +loteId,
      mes ? +mes : undefined,
      anio ? +anio : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movimientosService.findOne(+id);
  }

  @Patch(':id')
  @Permiso(87)
  update(@Param('id') id: string, @Body() updateMovimientoDto: UpdateMovimientoDto) {
    return this.movimientosService.update(+id, updateMovimientoDto);
  }

  @Delete(':id')
  @Permiso(88)
  remove(@Param('id') id: string) {
    return this.movimientosService.remove(+id);
  }
}
