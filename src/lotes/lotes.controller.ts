import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LotesService } from './lotes.service';
import { CreateLoteDto, UpdateLoteDto } from './dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { PermisoGuard } from 'src/auth/guards/permiso.guard';
import { Permiso } from 'src/auth/decorators/permiso.decorator';

@UseGuards(JwtGuard, PermisoGuard)
@Controller('lotes')
export class LotesController {
  constructor(private readonly lotesService: LotesService) {}

  @Post()
  @Permiso(77)
  create(@Body() createLoteDto: CreateLoteDto) {
    return this.lotesService.create(createLoteDto);
  }

  @Get()
  @Permiso(78)
  findAll() {
    return this.lotesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lotesService.findOne(+id);
  }

  @Get(':id/resumen-costos')
  getResumenCostos(@Param('id') id: string) {
    return this.lotesService.getResumenCostos(+id);
  }

  @Patch(':id')
  @Permiso(79)
  update(@Param('id') id: string, @Body() updateLoteDto: UpdateLoteDto) {
    return this.lotesService.update(+id, updateLoteDto);
  }

  @Delete(':id')
  @Permiso(80)
  remove(@Param('id') id: string) {
    return this.lotesService.remove(+id);
  }
}
