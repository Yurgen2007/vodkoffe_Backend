import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Between } from 'typeorm';
import { Notificaciones } from './entities/notificacione.entity';
import { CreateNotificacioneDto, UpdateNotificacioneDto } from './dto';
import { Usuarios } from 'src/usuarios/entities/usuario.entity';
import { WebsocketGateway } from 'src/websocket/websocket.gateway';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from 'src/auth/email/email.service';
import { stockBajoEmail, caducidadEmail } from 'src/auth/email/mail.body';
import { ConfigService } from '@nestjs/config';
import { Lotes } from 'src/lotes/entities/lote.entity';
import { Unidades } from 'src/unidades/entities/unidad.entity';

interface MailCredentials {
  serviceMail: string;
  mailUser: string;
  mailPassword: string;
}

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificaciones)
    private readonly notificacionRepository: Repository<Notificaciones>,
    @InjectRepository(Usuarios)
    private readonly usuarioRepository: Repository<Usuarios>,
    @InjectRepository(Lotes)
    private readonly loteRepository: Repository<Lotes>,
    @InjectRepository(Unidades)
    private readonly unidadesRepository: Repository<Unidades>,
    private readonly websocketGateway: WebsocketGateway,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) { }

  async create(dto: CreateNotificacioneDto) {
    const usuario = await this.usuarioRepository.findOneByOrFail({
      idUsuario: dto.fkUsuario,
    });

    const nueva = this.notificacionRepository.create({
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      requiereAccion: dto.requiereAccion,
      estado: dto.requiereAccion ? 'enProceso' : null,
      data: dto.data || {},
      fkUsuario: usuario,
    });

    return await this.notificacionRepository.save(nueva);
  }

  async findAll() {
    return this.notificacionRepository.find({
      relations: ['fkUsuario'],
      order: { createdAt: 'DESC' },
    });
  }

  async getNotificacionesPorUsuario(idUsuario: number) {
    const notificaciones = await this.notificacionRepository.find({
      where: { fkUsuario: { idUsuario } },
      order: { createdAt: 'DESC' },
    });

    // Retornar todas las notificaciones (ya no se filtran por productos)
    return notificaciones;
  }

  async findOne(id: number) {
    const notificacion = await this.notificacionRepository.findOne({
      where: { idNotificacion: id },
      relations: ['fkUsuario'],
    });

    if (!notificacion) {
      throw new NotFoundException('Notificacion no encontrada');
    }

    return notificacion;
  }

  async update(id: number, dto: UpdateNotificacioneDto) {
    const updateData: any = { ...dto };
    if (dto.fkUsuario && typeof dto.fkUsuario === 'number') {
      updateData.fkUsuario = { idUsuario: dto.fkUsuario };
    }

    await this.notificacionRepository.update(id, updateData);
    return this.findOne(id);
  }

  async marcarComoLeida(id: number) {
    // En lugar de marcar como leida, eliminamos la notificacion
    return this.remove(id);
  }

  async cambiarEstado(id: number, estado: 'aceptado' | 'cancelado') {
    const notificacion = await this.findOne(id);

    if (!notificacion.requiereAccion) {
      throw new Error('Esta notificacion no requiere accion');
    }

    // Actualizamos el estado
    notificacion.estado = estado;
    notificacion.leido = true;

    // Guardamos la notificacion actualizada
    const notificacionActualizada = await this.notificacionRepository.save(notificacion);

    // Obtenemos el usuario logueado que creo el movimiento desde la notificacion original
    const usuarioCreador = await this.usuarioRepository.findOne({
      where: { idUsuario: notificacion.data.usuarioCreadorId }, // <- Guardaremos esto en data
    });

    if (usuarioCreador) {
      // Creamos la respuesta para el creador del movimiento
      const respuesta = this.notificacionRepository.create({
        titulo: estado === 'aceptado' ? 'Movimiento aceptado' : 'Movimiento rechazado',
        mensaje:
          estado === 'aceptado'
            ? `Tu movimiento  fue aceptado.`
            : `Tu movimiento fue rechazado.`,
        requiereAccion: false,
        estado,
        leido: false,
        fkUsuario: usuarioCreador,
        data: notificacion.data,
      });

      await this.notificacionRepository.save(respuesta);

      // Emitimos la notificacion en tiempo real al usuario creador
      this.websocketGateway.emitirNotificacion(usuarioCreador.idUsuario, respuesta);
    }

    return notificacionActualizada;
  }


  async remove(id: number) {
    const existe = await this.notificacionRepository.findOne({
      where: { idNotificacion: id },
    });
    if (!existe) throw new NotFoundException('Notificacion no encontrada');

    return this.notificacionRepository.remove(existe);
  }

  async enviarYGuardarNotificacion(
    titulo: string,
    mensaje: string,
    requiereAccion: boolean,
    usuario: Usuarios,
    data: any = {},
    estado?: 'enProceso' | 'aceptado' | 'cancelado',
  ) {
    const notificacion = this.notificacionRepository.create({
      titulo,
      mensaje,
      requiereAccion,
      estado: requiereAccion ? (estado ?? 'enProceso') : null,
      data,
      leido: false,
      fkUsuario: usuario,
    });
    const guardada = await this.notificacionRepository.save(notificacion);

    console.log('Emision WS:', {
      usuario: usuario.idUsuario,
      notificacion: guardada,
    });

    this.websocketGateway.emitirNotificacion(usuario.idUsuario, guardada);
  }

  async notificarMovimientoPendiente(movimiento: any) {
    console.log('Iniciando notificacion de movimiento pendiente');
    console.log('Tipo de movimiento recibido:', movimiento.tipo?.nombre);
    console.log(
      'Usuario que creo el movimiento:',
      movimiento.usuario?.nombre,
      `(ID: ${movimiento.usuario?.idUsuario})`,
    );

    const tipoNombre = movimiento.tipo?.nombre?.toLowerCase?.();
    console.log('tipoNombre (normalizado):', tipoNombre);

    if (!tipoNombre) {
      console.log(
        'No se pudo determinar el tipo de movimiento. Cancelando notificacion.',
      );
      return;
    }

    if (!['salida', 'prestamo'].includes(tipoNombre)) {
      console.log(
        `Tipo de movimiento "${tipoNombre}" no requiere notificacion pendiente.`,
      );
      return;
    }

    console.log(
      `Tipo "${tipoNombre}" requiere notificacion. Buscando receptores...`,
    );

    const receptores = await this.usuarioRepository.find({
      where: [
        { fkRol: { nombre: 'Administrador' } },
        { fkRol: { nombre: 'Vendedor' } },
      ],
      relations: ['fkRol'],
    });

    console.log(
      'Receptores encontrados:',
      receptores.map((r) => `${r.nombre} (${r.fkRol?.nombre})`),
    );

    if (!receptores || receptores.length === 0) {
      console.log('No se encontraron receptores para notificacion.');
      return;
    }

    const mensaje = `Movimiento de tipo ${movimiento.tipo.nombre} realizado por el usuario ${movimiento.usuario.nombre}. Requiere revision.`;

    for (const user of receptores) {
      console.log(
        `Enviando notificacion a: ${user.nombre} (ID: ${user.idUsuario})`,
      );

      await this.enviarYGuardarNotificacion(
        'Movimiento pendiente',
        mensaje,
        true,
        user,
        { idMovimiento: movimiento.idMovimiento },
        'enProceso',
      );

      console.log(`Notificacion enviada a ${user.nombre}`);
    }

    console.log('Notificacion de movimiento pendiente finalizada.');
  }

  async notificarIngreso(movimiento: any) {
    if (movimiento.tipo.nombre.toLowerCase() === 'ingreso') {
      const admins = await this.usuarioRepository.find({
        where: {
          fkRol: { nombre: 'Administrador' },
        },
        relations: ['fkRol'],
      });
      const vendedores = await this.usuarioRepository.find({
        where: {
          fkRol: { nombre: 'Vendedor' },
        },
      });

      const mensaje = `Se realizo el Ingreso de ${movimiento.cantidad} elemento de nombre "${movimiento.elemento.nombre}" realizado por el usuario ${movimiento.usuario.nombre} al sitio ${movimiento.sitio.nombre}.`;

      for (const admin of admins) {
        await this.enviarYGuardarNotificacion(
          'Ingreso registrado',
          mensaje,
          false,
          admin,
          {
            idMovimiento: movimiento.id,
          },
        );
      }

      for (const vendedor of vendedores) {
        await this.enviarYGuardarNotificacion(
          'Ingreso registrado',
          mensaje,
          false,
          vendedor,
          {
            idMovimiento: movimiento.id,
          },
        );
      }
    }
  }

  // Metodo para buscar administradores y vendedores de forma case-insensitive
  private async buscarAdministradores(): Promise<Usuarios[]> {
    return this.usuarioRepository
      .createQueryBuilder('usuario')
      .innerJoin('usuario.fkRol', 'rol')
      .where('LOWER(rol.nombre) IN (:...nombres)', { nombres: ['administrador', 'vendedor'] })
      .getMany();
  }

  private async getMailCredentials(): Promise<MailCredentials> {
    // Buscar un usuario (administrador o vendedor) con credenciales configuradas
    const usuarioConCredenciales = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .innerJoin('usuario.fkRol', 'rol')
      .where('LOWER(rol.nombre) IN (:...nombres)', { nombres: ['administrador', 'vendedor'] })
      .andWhere('usuario.serviceMail IS NOT NULL')
      .andWhere('usuario.mailUser IS NOT NULL')
      .andWhere('usuario.mailPassword IS NOT NULL')
      .getOne();

    if (usuarioConCredenciales && usuarioConCredenciales.serviceMail && usuarioConCredenciales.mailUser && usuarioConCredenciales.mailPassword) {
      return {
        serviceMail: usuarioConCredenciales.serviceMail,
        mailUser: usuarioConCredenciales.mailUser,
        mailPassword: usuarioConCredenciales.mailPassword,
      };
    }

    // Fallback a variables de entorno
    return {
      serviceMail: this.configService.get('SERVICE_MAIL') || 'gmail',
      mailUser: this.configService.get('MAIL_USER') || '',
      mailPassword: this.configService.get('MAIL_PASSWORD') || '',
    };
  }

  async notificarStockBajo(elemento: any) {
    // El stock ahora se maneja por lotes y unidades
    // Esta función se mantiene por compatibilidad pero no hace nada
    console.log(`Verificación de stock para: ${elemento.nombre} - ahora manejado por lotes`);
  }

  async notificarProximaCaducidad(elemento: any) {
    // La fecha de vencimiento ahora se maneja por lote
    // Esta función se mantiene por compatibilidad pero no hace nada
    console.log(`Verificación de caducidad para: ${elemento.nombre} - ahora manejado por lotes`);
  }


  async notificarMovimientoAceptado(movimiento: any) {
    if (!movimiento?.usuario) return;

    const mensaje = `Tu movimiento de tipo "${movimiento.tipo.nombre}" ha sido aceptado.`;

    await this.enviarYGuardarNotificacion(
      'Movimiento aceptado',
      mensaje,
      false,
      movimiento.usuario,
      { idMovimiento: movimiento.idMovimiento },
    );
  }

  async notificarPrestamoConDevolucion(movimiento: any) {
    if (
      !movimiento?.usuario ||
      movimiento?.tipo?.nombre?.toLowerCase() !== 'prestamo'
    )
      return;

    const fecha = movimiento.fechaDevolucion
      ? new Date(movimiento.fechaDevolucion).toLocaleDateString('es-ES')
      : 'sin fecha definida';

    const mensaje = `Recuerda devolver el elemento "${movimiento.elemento.nombre}" antes del ${fecha}.`;

    await this.enviarYGuardarNotificacion(
      'Prestamo registrado',
      mensaje,
      false,
      movimiento.usuario,
      {
        idMovimiento: movimiento.idMovimiento,
        fechaDevolucion: movimiento.fechaDevolucion,
      },
    );
  }

  async verificarInventariosYNotificar() {
    console.log('Ejecutando verificación diaria de inventarios y lotes...');
    await this.notificarLotesPorVencer();
    await this.notificarLotesStockBajo();
    console.log('Verificación de inventarios y lotes completada');
  }

  /**
   * Notifica cuando la cantidad de unidades es menor o igual a 5
   * Ahora calcula la cantidad real de unidades desde la tabla de unidades
   */
  async notificarLotesStockBajo() {
    console.log('🔍 Verificando lotes con stock bajo...');

    const STOCK_MINIMO = 5;

    // Buscar lotes activos
    const lotesActivos = await this.loteRepository.find({
      where: { estado: true },
    });

    // Filtrar lotes con stock bajo calculando la cantidad real de unidades
    const lotesFiltrados: any[] = [];
    
    for (const lote of lotesActivos) {
      // Contar solo las unidades con estado DISPONIBLE
      const unidadesDisponibles = await this.unidadesRepository.count({
        where: { fkLote: lote.idLote, estado: 'DISPONIBLE' as any }
      });
      
      // Usar la cantidad real de unidades (si hay registros en la tabla de unidades)
      // Si no hay unidades registradas, usar el campo cantidadUnidades solo si es mayor que 0
      const cantidadReal = unidadesDisponibles > 0 ? unidadesDisponibles : (lote.cantidadUnidades || 0);
      
      // Solo incluir lotes con stock bajo real (cantidad real > 0 y <= STOCK_MINIMO)
      if (cantidadReal > 0 && cantidadReal <= STOCK_MINIMO) {
        lotesFiltrados.push({
          ...lote,
          cantidadUnidades: cantidadReal,
          unidadesReales: unidadesDisponibles
        });
      }
    }

    console.log(`📦 Se encontraron ${lotesFiltrados.length} lotes con stock bajo (≤${STOCK_MINIMO} unidades)`);
    console.log('Lotes:', lotesFiltrados.map(l => ({ codigo: l.codigoLote, cantidad: l.cantidadUnidades, unidadesReales: l.unidadesReales })));

    if (lotesFiltrados.length === 0) {
      console.log('✅ No hay lotes con stock bajo');
      return { message: 'No hay lotes con stock bajo', lotesEncontrados: 0 };
    }

    // Obtener administradores y vendedores
    const receptores = await this.buscarAdministradores();

    if (!receptores || receptores.length === 0) {
      console.log('⚠️ No se encontraron receptores para las notificaciones');
      return { message: 'No hay receptores', receptores: 0 };
    }

    // Obtener credenciales de email
    const mailCredentials = await this.getMailCredentials();

    let notificacionesEnviadas = 0;

    for (const lote of lotesFiltrados) {
      const mensaje = `El lote "${lote.codigoLote}" tiene stock bajo: ${lote.cantidadUnidades} unidades restantes. ¡Considera reabastecer!`;

      // Verificar si ya se envió una notificación para este lote (stock bajo)
      const notificacionExistente = await this.notificacionRepository.findOne({
        where: {
          titulo: `Stock bajo: ${lote.codigoLote}`,
        },
      });

      if (notificacionExistente) {
        console.log(`⏭️ Ya se notificó sobre el stock bajo del lote ${lote.codigoLote}, omitiendo...`);
        continue;
      }

      for (const usuario of receptores) {
        console.log(`📤 Enviando notificación de stock bajo a ${usuario.nombre} sobre lote ${lote.codigoLote}`);

        // 1. Guardar y emitir notificación
        await this.enviarYGuardarNotificacion(
          `Stock bajo: ${lote.codigoLote}`,
          mensaje,
          true,
          usuario,
          {
            idLote: lote.idLote,
            codigoLote: lote.codigoLote,
            cantidadUnidades: lote.cantidadUnidades,
          },
        );

        // 2. Enviar correo electrónico
        if (usuario.correo) {
          try {
            await this.emailService.sendStockBajoEmail(
              usuario.correo,
              usuario.nombre,
              lote.codigoLote,
              lote.cantidadUnidades,
              mailCredentials
            );
            console.log(`📧 Email de stock bajo enviado a ${usuario.correo}`);
          } catch (emailError) {
            console.error(`❌ Error enviando email de stock bajo a ${usuario.correo}:`, emailError);
          }
        }

        notificacionesEnviadas++;
      }
    }

    console.log(`✅ Verificación de stock bajo completada. Notificaciones enviadas: ${notificacionesEnviadas}`);
    return { message: 'Verificación de stock completada', notificacionesEnviadas };
  }

  /**
   * Notifica inmediatamente cuando se crea un lote con stock bajo
   * Ahora calcula la cantidad real de unidades desde la tabla de unidades
   */
  async notificarUnLoteStockBajo(lote: any) {
    console.log('🔔 Verificando lote recién creado para stock bajo:', lote.codigoLote);
    
    // Contar las unidades reales con estado DISPONIBLE
    const unidadesDisponibles = await this.unidadesRepository.count({
      where: { fkLote: lote.idLote, estado: 'DISPONIBLE' as any }
    });
    
    // Usar la cantidad real de unidades (si hay registros en la tabla de unidades)
    // Si no hay unidades registradas, usar el campo cantidadUnidades solo si es mayor que 0
    const cantidadReal = unidadesDisponibles > 0 ? unidadesDisponibles : (lote.cantidadUnidades || 0);
    
    if (!cantidadReal || cantidadReal > 5 || cantidadReal <= 0) {
      console.log('El lote no tiene stock bajo');
      return;
    }
    
    console.log(`✅ El lote ${lote.codigoLote} tiene stock bajo (${cantidadReal} unidades) - enviando notificación...`);
    
    // Obtener administradores y vendedores
    const receptores = await this.buscarAdministradores();
    
    if (!receptores || receptores.length === 0) {
      console.log('⚠️ No se encontraron receptores');
      return;
    }
    
    const mensaje = `El lote "${lote.codigoLote}" tiene stock bajo: ${cantidadReal} unidades restantes. ¡Considera reabastecer!`;
    
    // Obtener credenciales de email
    const mailCredentials = await this.getMailCredentials();
    
    for (const usuario of receptores) {
      // 1. Guardar notificación en el sistema
      await this.enviarYGuardarNotificacion(
        `Stock bajo: ${lote.codigoLote}`,
        mensaje,
        true,
        usuario,
        {
          idLote: lote.idLote,
          codigoLote: lote.codigoLote,
          cantidadUnidades: cantidadReal,
        },
      );
      
      // 2. Enviar email
      if (usuario.correo) {
        try {
          await this.emailService.sendStockBajoEmail(
            usuario.correo,
            usuario.nombre,
            lote.codigoLote,
            cantidadReal,
            mailCredentials
          );
          console.log(`📧 Email enviado a ${usuario.correo}`);
        } catch (emailError) {
          console.error(`❌ Error enviando email:`, emailError);
        }
      }
    }
    
    console.log(`✅ Notificación de stock bajo enviada para lote ${lote.codigoLote}`);
  }

  /**
   * Notifica a administradores y vendedores cuando un lote está por vencer en 15 días
   */
  async notificarLotesPorVencer() {
    console.log('🔍 Verificando lotes próximos a vencer...');

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Resetear a medianoche
    
    const fechaLimite = new Date(hoy);
    fechaLimite.setDate(fechaLimite.getDate() + 15); // 15 días hacia adelante

    // Buscar lotes que tienen fecha de vencimiento y están activos
    const allLotes = await this.loteRepository.find({
      where: { estado: true },
    });

    // Filtrar lotes por vencer en los próximos 15 días
    const lotesPorVencer = allLotes.filter(lote => {
      if (!lote.fechaVencimiento) return false;
      const fechaVenc = new Date(lote.fechaVencimiento);
      fechaVenc.setHours(0, 0, 0, 0);
      return fechaVenc >= hoy && fechaVenc <= fechaLimite;
    });

    console.log(`📦 Se encontraron ${lotesPorVencer.length} lotes por vencer en los próximos 15 días`);
    console.log('Lotes encontrados:', lotesPorVencer.map(l => ({ codigo: l.codigoLote, fecha: l.fechaVencimiento })));

    if (lotesPorVencer.length === 0) {
      console.log('✅ No hay lotes por vencer en los próximos 15 días');
      return { message: 'No hay lotes por vencer', lotesEncontrados: 0 };
    }

    // Obtener administradores y vendedores
    const receptores = await this.buscarAdministradores();

    if (!receptores || receptores.length === 0) {
      console.log('⚠️ No se encontraron receptores para las notificaciones');
      return { message: 'No hay receptores', receptores: 0 };
    }

    console.log(`📋 Receptores encontrados: ${receptores.map(r => r.nombre).join(', ')}`);

    // Por cada lote por vencer, notificar a todos los receptores
    let notificacionesEnviadas = 0;
    
    // Obtener credenciales de email
    const mailCredentials = await this.getMailCredentials();
    
    for (const lote of lotesPorVencer) {
      // Calcular la cantidad real de unidades
      const unidadesDisponibles = await this.unidadesRepository.count({
        where: { fkLote: lote.idLote, estado: 'DISPONIBLE' as any }
      });
      const cantidadReal = unidadesDisponibles > 0 ? unidadesDisponibles : (lote.cantidadUnidades || 0);
      
      const fechaVenc = new Date(lote.fechaVencimiento).toLocaleDateString('es-ES');
      const diasRestantes = Math.ceil((new Date(lote.fechaVencimiento).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

      const mensaje = `El lote "${lote.codigoLote}" (${cantidadReal} unidades) vence el ${fechaVenc}. ¡Quedan solo ${diasRestantes} días!`;

      // Verificar si ya se envió una notificación para este lote
      const notificacionExistente = await this.notificacionRepository.findOne({
        where: {
          titulo: `Lote por vencer: ${lote.codigoLote}`,
        },
      });

      if (notificacionExistente) {
        console.log(`⏭️ Ya se notificó sobre el lote ${lote.codigoLote}, omitiendo...`);
        continue;
      }

      for (const usuario of receptores) {
        console.log(`📤 Enviando notificación a ${usuario.nombre} sobre lote ${lote.codigoLote}`);

        // 1. Guardar y emitir notificación en el sistema
        await this.enviarYGuardarNotificacion(
          `Lote por vencer: ${lote.codigoLote}`,
          mensaje,
          false,
          usuario,
          {
            idLote: lote.idLote,
            codigoLote: lote.codigoLote,
            fechaVencimiento: lote.fechaVencimiento,
            diasRestantes,
            cantidadUnidades: cantidadReal,
          },
        );
        
        // 2. Enviar correo electrónico
        if (usuario.correo) {
          try {
            await this.emailService.sendLotePorVencerEmail(
              usuario.correo,
              usuario.nombre,
              lote.codigoLote,
              fechaVenc,
              diasRestantes,
              mailCredentials
            );
            console.log(`📧 Email enviado a ${usuario.correo}`);
          } catch (emailError) {
            console.error(`❌ Error enviando email a ${usuario.correo}:`, emailError);
          }
        }
        
        notificacionesEnviadas++;
      }
    }

    console.log(`✅ Verificación de lotes por vencer completada. Notificaciones enviadas: ${notificacionesEnviadas}`);
    return { message: 'Verificación completada', notificacionesEnviadas };
  }

  /**
   * Notifica inmediatamente cuando se crea un lote que está por vencer
   */
  async notificarUnLotePorVencer(lote: any) {
    console.log('🔔 Verificando lote recién creado:', lote.codigoLote);
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (!lote.fechaVencimiento) {
      console.log('El lote no tiene fecha de vencimiento');
      return;
    }
    
    const fechaVenc = new Date(lote.fechaVencimiento);
    fechaVenc.setHours(0, 0, 0, 0);
    const diasRestantes = Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes <= 0 || diasRestantes > 15) {
      console.log(`El lote ${lote.codigoLote} no está en rango de 15 días (${diasRestantes} días)`);
      return;
    }
    
    // Calcular la cantidad real de unidades
    const unidadesDisponibles = await this.unidadesRepository.count({
      where: { fkLote: lote.idLote, estado: 'DISPONIBLE' as any }
    });
    const cantidadReal = unidadesDisponibles > 0 ? unidadesDisponibles : (lote.cantidadUnidades || 0);
    
    console.log(`✅ El lote ${lote.codigoLote} vence en ${diasRestantes} días - enviando notificación...`);
    
    // Obtener administradores y vendedores
    const receptores = await this.buscarAdministradores();
    
    if (!receptores || receptores.length === 0) {
      console.log('⚠️ No se encontraron receptores');
      return;
    }
    
    const fechaVencStr = fechaVenc.toLocaleDateString('es-ES');
    const mensaje = `El lote "${lote.codigoLote}" (${cantidadReal} unidades) vence el ${fechaVencStr}. ¡Quedan solo ${diasRestantes} días!`;
    
    // Obtener credenciales de email
    const mailCredentials = await this.getMailCredentials();
    
    for (const usuario of receptores) {
      // 1. Guardar notificación en el sistema
      await this.enviarYGuardarNotificacion(
        `Lote por vencer: ${lote.codigoLote}`,
        mensaje,
        false,
        usuario,
        {
          idLote: lote.idLote,
          codigoLote: lote.codigoLote,
          fechaVencimiento: lote.fechaVencimiento,
          diasRestantes,
          cantidadUnidades: cantidadReal,
        },
      );
      
      // 2. Enviar email
      if (usuario.correo) {
        try {
          await this.emailService.sendLotePorVencerEmail(
            usuario.correo,
            usuario.nombre,
            lote.codigoLote,
            fechaVencStr,
            diasRestantes,
            mailCredentials
          );
          console.log(`📧 Email enviado a ${usuario.correo}`);
        } catch (emailError) {
          console.error(`❌ Error enviando email:`, emailError);
        }
      }
    }
    
    console.log(`✅ Notificación enviada para lote ${lote.codigoLote}`);
  }
}
