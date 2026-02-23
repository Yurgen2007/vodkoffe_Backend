import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UnidadesMedidaService } from './unidades-medida.service';
import { CreateUnidadesMedidaDto, UpdateUnidadesMedidaDto } from './dto'; 
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { PermisoGuard } from 'src/auth/guards/permiso.guard';
import { Permiso } from 'src/auth/decorators/permiso.decorator';

@UseGuards(JwtGuard, PermisoGuard)
@Controller('unidades-medida')
export class UnidadesMedidaController {
  constructor(private readonly unidadesMedidaService: UnidadesMedidaService) {}

  @Post()
  @Permiso(18)
  create(@Body() createUnidadesMedidaDto: CreateUnidadesMedidaDto) {
    return this.unidadesMedidaService.create(createUnidadesMedidaDto);
  }

  @Get()
  findAll() {
    return this.unidadesMedidaService.findAll();
  }

  @Get(':idUnidad')
  findOne(@Param('idUnidad') idUnidad: number) {
    return this.unidadesMedidaService.findOne(+idUnidad);
  }

  @Patch(':idUnidad')
  @Permiso(20)
  update(@Param('idUnidad') idUnidad: number, @Body() updateUnidadesMedidaDto: UpdateUnidadesMedidaDto) {
    return this.unidadesMedidaService.update(+idUnidad, updateUnidadesMedidaDto);
  }

  @Patch('state/:idUnidad')
  status(@Param('idUnidad') idUnidad: number) {
    return this.unidadesMedidaService.changeStatus(+idUnidad);
  }

  @Delete(':idUnidad')
  @Permiso(21)
  remove(@Param('idUnidad') idUnidad: number) {
    return this.unidadesMedidaService.remove(+idUnidad);
  }
}
