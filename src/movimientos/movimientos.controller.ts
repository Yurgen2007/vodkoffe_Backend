import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { CreateMovimientoDto, UpdateMovimientoDto } from './dto';

@Controller('movimientos')
export class MovimientosController {
  constructor(private readonly movimientosService: MovimientosService) {}

  @Post()
  create(@Body() createMovimientoDto: CreateMovimientoDto) {
    return this.movimientosService.create(createMovimientoDto);
  }

  @Get()
  findAll() {
    return this.movimientosService.findAll();
  }

  @Get('reporte-mensual')
  getReporteMensual(@Query('mes') mes: string, @Query('anio') anio: string) {
    return this.movimientosService.getReporteMensual(+mes, +anio);
  }

  @Get('reporte-producto/:productoId')
  getReportePorProducto(
    @Param('productoId') productoId: string,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
  ) {
    return this.movimientosService.getReportePorProducto(
      +productoId,
      mes ? +mes : undefined,
      anio ? +anio : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movimientosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMovimientoDto: UpdateMovimientoDto) {
    return this.movimientosService.update(+id, updateMovimientoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movimientosService.remove(+id);
  }
}
