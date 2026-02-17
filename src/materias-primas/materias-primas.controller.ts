import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { MateriasPrimasService } from './materias-primas.service';
import { CreateMateriaPrimaDto } from './dto/create-materia-prima.dto';
import { UpdateMateriaPrimaDto } from './dto/update-materia-prima.dto';

@Controller('materias-primas')
export class MateriasPrimasController {
  constructor(private readonly materiasPrimasService: MateriasPrimasService) {}

  @Post()
  create(@Body() createMateriaPrimaDto: CreateMateriaPrimaDto) {
    return this.materiasPrimasService.create(createMateriaPrimaDto);
  }

  @Get()
  findAll() {
    return this.materiasPrimasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materiasPrimasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMateriaPrimaDto: UpdateMateriaPrimaDto,
  ) {
    return this.materiasPrimasService.update(id, updateMateriaPrimaDto);
  }

  @Patch('status/:id')
  changeStatus(@Param('id', ParseIntPipe) id: number) {
    return this.materiasPrimasService.changeStatus(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.materiasPrimasService.remove(id);
  }
}
