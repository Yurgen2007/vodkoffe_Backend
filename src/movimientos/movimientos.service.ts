import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Movimientos } from './entities/movimiento.entity';
import { CreateMovimientoDto, UpdateMovimientoDto } from './dto';
import { Lotes } from '../lotes/entities/lote.entity';
import { Unidades } from '../unidades/entities/unidad.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class MovimientosService {
  constructor(
    @InjectRepository(Movimientos)
    private readonly movimientosRepository: Repository<Movimientos>,
    @InjectRepository(Lotes)
    private readonly lotesRepository: Repository<Lotes>,
    @InjectRepository(Unidades)
    private readonly unidadesRepository: Repository<Unidades>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async create(createMovimientoDto: CreateMovimientoDto): Promise<Movimientos> {
    // Si es movimiento de inventario
    if (createMovimientoDto.tipo === 'INVENTARIO') {
      return await this.createMovimientoInventario(createMovimientoDto);
    }

    // Si es VENTA o NO_VENTA (movimientos originales)
    return await this.createMovimientoVenta(createMovimientoDto);
  }

  private async createMovimientoVenta(createMovimientoDto: CreateMovimientoDto): Promise<Movimientos> {
    // Validar que al menos una cantidad sea mayor a 0
    const totalUnidades = createMovimientoDto.cantidadVendida + 
                          createMovimientoDto.cantidadDegustacion + 
                          createMovimientoDto.cantidadAlianza;
    
    if (totalUnidades === 0) {
      throw new BadRequestException('Debe especificar al menos una cantidad mayor a 0');
    }

    // Buscar el lote
    const lote = await this.lotesRepository.findOne({
      where: { idLote: createMovimientoDto.fkLote },
      relations: ['unidades'],
    });

    if (!lote) {
      throw new NotFoundException(`Lote con ID ${createMovimientoDto.fkLote} no encontrado`);
    }

    // Verificar que el lote tenga suficientes unidades disponibles
    const unidadesDisponibles = lote.unidades.filter(u => u.estado === 'DISPONIBLE');
    if (unidadesDisponibles.length < totalUnidades) {
      throw new BadRequestException(
        `El lote solo tiene ${unidadesDisponibles.length} unidades disponibles, pero se intentan mover ${totalUnidades}`
      );
    }

    // Crear el movimiento
    // Si no se proporciona fechaMovimiento, usar la fecha actual
    const fechaMovimiento = createMovimientoDto.fechaMovimiento || new Date();
    
    const movimiento = this.movimientosRepository.create({
      tipo: createMovimientoDto.tipo,
      cantidadVendida: createMovimientoDto.cantidadVendida,
      cantidadDegustacion: createMovimientoDto.cantidadDegustacion,
      cantidadAlianza: createMovimientoDto.cantidadAlianza,
      cantidadTotal: totalUnidades,
      precioUnitario: createMovimientoDto.precioUnitario,
      precioTotal: createMovimientoDto.cantidadVendida * createMovimientoDto.precioUnitario,
      descripcion: createMovimientoDto.descripcion,
      fechaMovimiento: fechaMovimiento,
      lote: lote,
    });

    // Guardar el movimiento
    const savedMovimiento = await this.movimientosRepository.save(movimiento);

    // Actualizar el estado de las unidades vendidas/movidas
    const unidadesAMover = unidadesDisponibles.slice(0, totalUnidades);
    
    // Las primeras unidades son vendidas
    for (let i = 0; i < createMovimientoDto.cantidadVendida; i++) {
      await this.unidadesRepository.update(unidadesAMover[i].idUnidad, {
        estado: 'VENDIDA' as any,
      });
    }
    
    // Las siguientes son para degustación
    const startDegustacion = createMovimientoDto.cantidadVendida;
    for (let i = 0; i < createMovimientoDto.cantidadDegustacion; i++) {
      await this.unidadesRepository.update(unidadesAMover[startDegustacion + i].idUnidad, {
        estado: 'DEGUSTACION' as any,
      });
    }
    
    // Las siguientes son para alianza
    const startAlianza = startDegustacion + createMovimientoDto.cantidadDegustacion;
    for (let i = 0; i < createMovimientoDto.cantidadAlianza; i++) {
      await this.unidadesRepository.update(unidadesAMover[startAlianza + i].idUnidad, {
        estado: 'ALIANZA' as any,
      });
    }

    // Notificar si el lote se agotó y marcar como inactivo
    const unidadesRestantes = await this.lotesRepository.findOne({
      where: { idLote: createMovimientoDto.fkLote },
      relations: ['unidades'],
    });
    
    const disponibles = unidadesRestantes?.unidades.filter(u => u.estado === 'DISPONIBLE').length || 0;
    if (disponibles === 0) {
      // Inactivar el lote completamente
      await this.lotesRepository.update(createMovimientoDto.fkLote, { estado: false });
      
      await this.notificacionesService.create({
        titulo: 'Lote agotado',
        mensaje: `El lote ${lote.codigoLote} se ha agotado y ha sido inactivado`,
        fkUsuario: createMovimientoDto.fkUsuario || 1,
      });
    }

    return savedMovimiento;
  }

  private async createMovimientoInventario(createMovimientoDto: CreateMovimientoDto): Promise<Movimientos> {
    // Validar cantidad de inventario
    if (!createMovimientoDto.cantidadInventario || createMovimientoDto.cantidadInventario <= 0) {
      throw new BadRequestException('La cantidad de inventario debe ser mayor a 0');
    }

    // Buscar la unidad
    const unidad = await this.unidadesRepository.findOne({
      where: { idUnidad: createMovimientoDto.fkUnidad },
    });

    if (!unidad) {
      throw new NotFoundException(`Unidad con ID ${createMovimientoDto.fkUnidad} no encontrada`);
    }

    // Crear el movimiento
    const fechaMovimiento = createMovimientoDto.fechaMovimiento || new Date();
    
    const movimiento = this.movimientosRepository.create({
      tipo: createMovimientoDto.tipo,
      cantidadTotal: createMovimientoDto.cantidadInventario,
      cantidadInventario: createMovimientoDto.cantidadInventario,
      tipoInventario: createMovimientoDto.tipoInventario,
      descripcion: createMovimientoDto.descripcion,
      fechaMovimiento: fechaMovimiento,
      unidad: unidad,
    });

    return await this.movimientosRepository.save(movimiento);
  }

  async findAll(): Promise<Movimientos[]> {
    return await this.movimientosRepository.find({
      relations: ['lote', 'unidad', 'usuario'],
      order: { fechaMovimiento: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Movimientos> {
    const movimiento = await this.movimientosRepository.findOne({
      where: { idMovimiento: id },
      relations: ['lote', 'unidad', 'usuario'],
    });

    if (!movimiento) {
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    }

    return movimiento;
  }

  async findByLote(loteId: number): Promise<Movimientos[]> {
    return await this.movimientosRepository.find({
      where: { lote: { idLote: loteId } },
      relations: ['lote', 'unidad', 'usuario'],
      order: { fechaMovimiento: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Movimientos[]> {
    return await this.movimientosRepository.find({
      where: {
        fechaMovimiento: Between(startDate, endDate),
      },
      relations: ['lote', 'unidad', 'usuario'],
      order: { fechaMovimiento: 'DESC' },
    });
  }

  async update(id: number, updateMovimientoDto: UpdateMovimientoDto): Promise<Movimientos> {
    const movimiento = await this.findOne(id);
    
    Object.assign(movimiento, updateMovimientoDto);
    
    return await this.movimientosRepository.save(movimiento);
  }

  async remove(id: number): Promise<void> {
    const movimiento = await this.findOne(id);
    await this.movimientosRepository.remove(movimiento);
  }

  async getResumenByLote(loteId: number) {
    const movimientos = await this.movimientosRepository.find({
      where: { lote: { idLote: loteId } },
      relations: ['lote'],
    });

    const movimientosVenta = movimientos.filter(m => m.tipo === 'VENTA');
    const totalVendidas = movimientosVenta.reduce((sum, m) => sum + m.cantidadVendida, 0);
    const totalDegustacion = movimientosVenta.reduce((sum, m) => sum + m.cantidadDegustacion, 0);
    const totalAlianza = movimientosVenta.reduce((sum, m) => sum + m.cantidadAlianza, 0);
    const totalVentas = movimientosVenta.reduce((sum, m) => sum + Number(m.precioTotal || 0), 0);
    
    const movimientosNoVenta = movimientos.filter(m => m.tipo === 'NO_VENTA');
    const totalNoVentas = movimientosNoVenta.reduce((sum, m) => sum + m.cantidadTotal, 0);

    return {
      totalMovimientos: movimientos.length,
      totalVendidas,
      totalDegustacion,
      totalAlianza,
      totalVentas,
      totalNoVentas,
      movimientosVenta,
      movimientosNoVenta,
    };
  }

  async getResumenGeneral() {
    const movimientos = await this.movimientosRepository.find({
      relations: ['lote'],
    });

    const movimientosVenta = movimientos.filter(m => m.tipo === 'VENTA');
    const totalVendidas = movimientosVenta.reduce((sum, m) => sum + m.cantidadVendida, 0);
    const totalDegustacion = movimientosVenta.reduce((sum, m) => sum + m.cantidadDegustacion, 0);
    const totalAlianza = movimientosVenta.reduce((sum, m) => sum + m.cantidadAlianza, 0);
    const totalIngresos = movimientosVenta.reduce((sum, m) => sum + Number(m.precioTotal || 0), 0);
    
    const movimientosNoVenta = movimientos.filter(m => m.tipo === 'NO_VENTA');
    const totalNoVentas = movimientosNoVenta.reduce((sum, m) => sum + m.cantidadTotal, 0);

    // Calcular egresos (costo de materias primas de los lotes vendidos)
    const lotesConVentas = new Set(movimientosVenta.map(m => m.lote?.idLote).filter(Boolean));
    let totalEgresos = 0;
    
    for (const loteId of lotesConVentas) {
      const lote = await this.lotesRepository.findOne({
        where: { idLote: loteId },
      });
      if (lote) {
        totalEgresos += Number(lote.costoMateriasPrimas || 0);
      }
    }

    const ganancias = totalIngresos - totalEgresos;

    return {
      totalMovimientos: movimientos.length,
      totalVendidas,
      totalDegustacion,
      totalAlianza,
      totalIngresos,
      totalEgresos,
      ganancias,
      totalNoVentas,
    };
  }
}
