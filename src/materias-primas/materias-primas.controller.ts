import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { MateriasPrimasService } from './materias-primas.service';
import { CreateMateriaPrimaDto } from './dto/create-materia-prima.dto';
import { UpdateMateriaPrimaDto } from './dto/update-materia-prima.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { PermisoGuard } from 'src/auth/guards/permiso.guard';
import { Permiso } from 'src/auth/decorators/permiso.decorator';

@UseGuards(JwtGuard, PermisoGuard)
@Controller('materias-primas')
export class MateriasPrimasController {
  constructor(private readonly materiasPrimasService: MateriasPrimasService) {}

  @Post()
  @Permiso(81)
  create(@Body() createMateriaPrimaDto: CreateMateriaPrimaDto) {
    return this.materiasPrimasService.create(createMateriaPrimaDto);
  }

  @Get()
  @Permiso(82)
  findAll() {
    return this.materiasPrimasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materiasPrimasService.findOne(id);
  }

  @Patch(':id')
  @Permiso(83)
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
  @Permiso(84)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.materiasPrimasService.remove(id);
  }
}
