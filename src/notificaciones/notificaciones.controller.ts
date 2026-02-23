import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { CreateNotificacioneDto, UpdateNotificacioneDto } from './dto';
import { WebsocketGateway } from 'src/websocket/websocket.gateway';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuarios } from 'src/usuarios/entities/usuario.entity';
import { Repository } from 'typeorm';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { PermisoGuard } from 'src/auth/guards/permiso.guard';
import { Permiso } from 'src/auth/decorators/permiso.decorator';

@UseGuards(JwtGuard, PermisoGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(

    private readonly notificacionesService: NotificacionesService,
      @InjectRepository(Usuarios)
  private readonly usuarioRepository: Repository<Usuarios>,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  @Post()
  async create(@Body() dto: CreateNotificacioneDto) {
    const notificacion = await this.notificacionesService.create(dto);
    this.websocketGateway.emitirNotificacion(
      notificacion.fkUsuario.idUsuario,
      notificacion,
    );
    return notificacion;
  }

  @Get('usuario/:idUsuario')
  getNotificacionesPorUsuario(@Param('idUsuario') idUsuario: number) {
    return this.notificacionesService.getNotificacionesPorUsuario(+idUsuario);
  }

  @Get()
  @Permiso(93)
  findAll() {
    return this.notificacionesService.findAll();
  }

  @Get(':idNotificacion')
  findOne(@Param('idNotificacion') idNotificacion: number) {
    return this.notificacionesService.findOne(+idNotificacion);
  }

  @Patch(':idNotificacion')
  update(
    @Param('idNotificacion') idNotificacion: number,
    @Body() dto: UpdateNotificacioneDto,
  ) {
    return this.notificacionesService.update(+idNotificacion, dto);
  }

  @Patch(':idNotificacion/leida')
  @Permiso(94)
  marcarComoLeida(@Param('idNotificacion') idNotificacion: number) {
    return this.notificacionesService.marcarComoLeida(+idNotificacion);
  }

  @Patch(':idNotificacion/estado')
  cambiarEstado(
    @Param('idNotificacion') idNotificacion: number,
    @Body('estado') estado: 'aceptado' | 'cancelado',
  ) {
    return this.notificacionesService.cambiarEstado(+idNotificacion, estado);
  }

  @Delete(':idNotificacion')
  @Permiso(95)
  remove(@Param('idNotificacion') idNotificacion: number) {
    return this.notificacionesService.remove(+idNotificacion);
  }

  @Get('verificar-inventario/:idUsuario')
  async verificarInventario(@Param('idUsuario') id: number) {
    console.log('Recibida peticion para verificar inventario del usuario:', id);
    
    const usuario = await this.usuarioRepository.findOne({
      where: { idUsuario: id },
      relations: ['fkRol'],
    });

    if (!usuario) {
      console.log('Usuario no encontrado:', id);
      throw new NotFoundException('Usuario no encontrado');
    }

    console.log('Usuario encontrado:', usuario.nombre, '- Rol:', usuario.fkRol?.nombre);

    // Verificar que sea Administrador (case insensitive)
    if (usuario.fkRol?.nombre?.toLowerCase() !== 'administrador') {
      console.log('Usuario no es Administrador, solo Administradores pueden verificar inventario');
      return { mensaje: 'Solo los administradores pueden verificar inventarios' };
    }

    console.log('Iniciando verificacion de inventarios...');
    await this.notificacionesService.verificarInventariosYNotificar();
    console.log('Verificacion completada');

    return { mensaje: 'Revision de inventarios ejecutada' };
  }
}
