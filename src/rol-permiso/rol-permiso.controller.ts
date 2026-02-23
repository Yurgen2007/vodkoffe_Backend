import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RolPermisoService } from './rol-permiso.service';
import { CreateRolPermisoDto, UpdateRolPermisoDto } from './dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { PermisoGuard } from 'src/auth/guards/permiso.guard';
import { Permiso } from 'src/auth/decorators/permiso.decorator';

@UseGuards(JwtGuard, PermisoGuard)
@Controller('rol-permiso')
export class RolPermisoController {
  constructor(private readonly rolPermisoService: RolPermisoService) {}

  @Post()
  create(@Body() createRolPermisoDto: CreateRolPermisoDto) {
    return this.rolPermisoService.create(createRolPermisoDto);
  }

  @Get()
  findAll() {
    return this.rolPermisoService.findAll();
  }

  @Get(':idRolPermiso')
  findOne(@Param('idRolPermiso') idRolPermiso: number) {
    return this.rolPermisoService.findOne(+idRolPermiso);
  }

  @Patch('asign-permiso/:idPermiso/:idRol')
  async changeStatus(@Param('idPermiso', ParseIntPipe) idPermiso: number, @Param('idRol', ParseIntPipe) idRol: number){
    return this.rolPermisoService.changeStatus(idPermiso, idRol);
  }

  @Patch(':idRolPermiso')
  update(@Param('idRolPermiso') idRolPermiso: number, @Body() updateRolPermisoDto: UpdateRolPermisoDto) {
    return this.rolPermisoService.update(+idRolPermiso, updateRolPermisoDto);
  }

  @Get('rol/:idrol/permisos')
  async findpermisos(@Param('idrol') idrol: number){
    return this.rolPermisoService.getpermisosrol(idrol)
  }

}
