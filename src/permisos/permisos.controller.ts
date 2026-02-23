import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { CreatePermisoDto, UpdatePermisoDto } from './dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { PermisoGuard } from 'src/auth/guards/permiso.guard';
import { Permiso } from 'src/auth/decorators/permiso.decorator';

@UseGuards(JwtGuard, PermisoGuard)
@Controller('permisos')
export class PermisosController {
  constructor(private readonly permisosService: PermisosService) {}

  @Post()
  create(@Body() createPermisoDto: CreatePermisoDto) {
    return this.permisosService.create(createPermisoDto);
  }

  @Get()
  findAll() {
    return this.permisosService.findAll();
  }

  @Get(':idPermiso')
  findOne(@Param('idPermiso') idPermiso: number) {
    return this.permisosService.findOne(+idPermiso);
  }

  @Patch(':idPermiso')
  update(@Param('idPermiso') idPermiso: number, @Body() updatePermisoDto: UpdatePermisoDto) {
    return this.permisosService.update(+idPermiso, updatePermisoDto);
  }

  @Delete(':idPermiso')
  remove(@Param('idPermiso') idPermiso: number) {
    return this.permisosService.remove(+idPermiso);
  }
}
