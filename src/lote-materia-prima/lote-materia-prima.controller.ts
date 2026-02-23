import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LoteMateriaPrimaService } from './lote-materia-prima.service';
import { CreateLoteMateriaPrimaDto, UpdateLoteMateriaPrimaDto } from './dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { PermisoGuard } from 'src/auth/guards/permiso.guard';
import { Permiso } from 'src/auth/decorators/permiso.decorator';

@UseGuards(JwtGuard, PermisoGuard)
@Controller('lote-materia-prima')
export class LoteMateriaPrimaController {
  constructor(private readonly loteMateriaPrimaService: LoteMateriaPrimaService) {}

  @Post()
  @Permiso(89)
  create(@Body() createDto: CreateLoteMateriaPrimaDto) {
    return this.loteMateriaPrimaService.create(createDto);
  }

  @Get()
  @Permiso(90)
  findAll() {
    return this.loteMateriaPrimaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loteMateriaPrimaService.findOne(+id);
  }

  @Patch(':id')
  @Permiso(91)
  update(@Param('id') id: string, @Body() updateDto: UpdateLoteMateriaPrimaDto) {
    return this.loteMateriaPrimaService.update(+id, updateDto);
  }

  @Delete(':id')
  @Permiso(92)
  remove(@Param('id') id: string) {
    return this.loteMateriaPrimaService.remove(+id);
  }
}