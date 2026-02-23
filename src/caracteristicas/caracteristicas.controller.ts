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
import { CaracteristicasService } from './caracteristicas.service';
import { CreateCaracteristicaDto } from './dto/create-caracteristica.dto';
import { UpdateCaracteristicaDto } from './dto/update-caracteristica.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { PermisoGuard } from 'src/auth/guards/permiso.guard';
import { Permiso } from 'src/auth/decorators/permiso.decorator';

@UseGuards(JwtGuard, PermisoGuard)
@Controller('caracteristicas')
export class CaracteristicasController {
  constructor(private readonly caracteristicasService: CaracteristicasService) {}

  @Post()
  @Permiso(73)
  create(@Body() createCaracteristicaDto: CreateCaracteristicaDto) {
    return this.caracteristicasService.create(createCaracteristicaDto);
  }

  @Get()
  @Permiso(74)
  findAll() {
    return this.caracteristicasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.caracteristicasService.findOne(id);
  }

  @Patch(':id')
  @Permiso(75)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCaracteristicaDto: UpdateCaracteristicaDto,
  ) {
    return this.caracteristicasService.update(id, updateCaracteristicaDto);
  }

  @Patch('status/:id')
  changeStatus(@Param('id', ParseIntPipe) id: number) {
    return this.caracteristicasService.changeStatus(id);
  }

  @Delete(':id')
  @Permiso(76)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.caracteristicasService.remove(id);
  }
}
