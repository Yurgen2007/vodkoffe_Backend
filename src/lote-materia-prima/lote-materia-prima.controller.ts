import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LoteMateriaPrimaService } from './lote-materia-prima.service';
import { CreateLoteMateriaPrimaDto, UpdateLoteMateriaPrimaDto } from './dto';

@Controller('lote-materia-prima')
export class LoteMateriaPrimaController {
  constructor(private readonly loteMateriaPrimaService: LoteMateriaPrimaService) {}

  @Post()
  create(@Body() createDto: CreateLoteMateriaPrimaDto) {
    return this.loteMateriaPrimaService.create(createDto);
  }

  @Get()
  findAll() {
    return this.loteMateriaPrimaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loteMateriaPrimaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateLoteMateriaPrimaDto) {
    return this.loteMateriaPrimaService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loteMateriaPrimaService.remove(+id);
  }
}