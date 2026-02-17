import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Movimientos } from './entities/movimiento.entity';
import { CreateMovimientoDto, UpdateMovimientoDto } from './dto';
import { Lotes } from '../lotes/entities/lote.entity';
import { Unidades } from '../unidades/entities/unidad.entity';

@Injectable()
export class MovimientosService {
  constructor(
    @InjectRepository(Movimientos)
    private readonly movimientosRepository: Repository<Movimientos>,
    @InjectRepository(Lotes)
    private readonly lotesRepository: Repository<Lotes>,
    @InjectRepository(Unidades)
    private readonly unidadesRepository: Repository<Unidades>,
  ) {}

  async create(createMovimientoDto: CreateMovimientoDto): Promise<Movimientos> {
    // Validar que al menos una cantidad sea mayor a 0
    const totalUnidades = createMovimientoDto.cantidadVendida + 
                          createMovimientoDto.cantidadDegustacion + 
                          createMovimientoDto.cantidadAlianza +
                          createMovimientoDto.cantidadOtro;
    
    if (totalUnidades === 0) {
      throw new BadRequestException('Debe especificar al menos una cantidad mayor a 0');
    }

    // Validar que si es NO_VENTA, se especifique el tipoNoVenta
    if (createMovimientoDto.tipo === 'NO_VENTA' && !createMovimientoDto.tipoNoVenta) {
      throw new BadRequestException('Debe especificar el tipo de no venta (DEGUSTACION, ALIANZA u OTRO)');
    }

    // Validar que si es NO_VENTA, no haya cantidad vendida
    if (createMovimientoDto.tipo === 'NO_VENTA' && createMovimientoDto.cantidadVendida > 0) {
      throw new BadRequestException('Un movimiento de tipo NO_VENTA no puede tener cantidad vendida');
    }

    // Validar que si es VENTA, no haya cantidades de no venta
    if (createMovimientoDto.tipo === 'VENTA' && 
        (createMovimientoDto.cantidadDegustacion > 0 || 
         createMovimientoDto.cantidadAlianza > 0 || 
         createMovimientoDto.cantidadOtro > 0)) {
      throw new BadRequestException('Un movimiento de tipo VENTA solo puede tener cantidad vendida');
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
    const movimiento = this.movimientosRepository.create({
      tipo: createMovimientoDto.tipo,
      tipoNoVenta: createMovimientoDto.tipoNoVenta,
      cantidadVendida: createMovimientoDto.cantidadVendida,
      cantidadDegustacion: createMovimientoDto.cantidadDegustacion,
      cantidadAlianza: createMovimientoDto.cantidadAlianza,
      cantidadOtro: createMovimientoDto.cantidadOtro,
      cantidadTotal: totalUnidades,
      precioUnitario: createMovimientoDto.precioUnitario,
      precioTotal: createMovimientoDto.cantidadVendida * createMovimientoDto.precioUnitario,
      descripcion: createMovimientoDto.descripcion,
      fechaMovimiento: createMovimientoDto.fechaMovimiento,
      lote: lote,
    });

    // Guardar el movimiento
    const savedMovimiento = await this.movimientosRepository.save(movimiento);

    // Actualizar el estado de las unidades vendidas/movidas
    const unidadesAMover = unidadesDisponibles.slice(0, totalUnidades);
    
    // Asignar estados según el tipo de movimiento
    let indiceActual = 0;
    
    // Unidades vendidas
    for (let i = 0; i < createMovimientoDto.cantidadVendida; i++) {
      unidadesAMover[indiceActual].estado = 'VENDIDA';
      indiceActual++;
    }
    
    // Unidades de degustación
    for (let i = 0; i < createMovimientoDto.cantidadDegustacion; i++) {
      unidadesAMover[indiceActual].estado = 'DEGUSTACION';
      indiceActual++;
    }
    
    // Unidades de alianza
    for (let i = 0; i < createMovimientoDto.cantidadAlianza; i++) {
      unidadesAMover[indiceActual].estado = 'ALIANZA';
      indiceActual++;
    }

    // Unidades de tipo OTRO
    for (let i = 0; i < createMovimientoDto.cantidadOtro; i++) {
      unidadesAMover[indiceActual].estado = 'OTRO';
      indiceActual++;
    }

    // Guardar las unidades actualizadas
    await this.unidadesRepository.save(unidadesAMover);

    return savedMovimiento;
  }

  findAll(): Promise<Movimientos[]> {
    return this.movimientosRepository.find({
      relations: ['lote', 'lote.producto'],
      order: { fechaMovimiento: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Movimientos> {
    const movimiento = await this.movimientosRepository.findOne({
      where: { idMovimiento: id },
      relations: ['lote', 'lote.producto'],
    });
    if (!movimiento) {
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    }
    return movimiento;
  }

  async update(id: number, updateMovimientoDto: UpdateMovimientoDto): Promise<Movimientos> {
    const movimiento = await this.findOne(id);
    this.movimientosRepository.merge(movimiento, updateMovimientoDto);
    return this.movimientosRepository.save(movimiento);
  }

  async remove(id: number): Promise<void> {
    const movimiento = await this.findOne(id);
    await this.movimientosRepository.remove(movimiento);
  }

  // Reporte de ventas por mes
  async getReporteMensual(mes: number, anio: number) {
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0);

    const movimientos = await this.movimientosRepository.find({
      where: {
        fechaMovimiento: Between(fechaInicio, fechaFin),
      },
      relations: ['lote', 'lote.producto'],
    });

    const totalVendidas = movimientos.reduce((sum, m) => sum + m.cantidadVendida, 0);
    const totalDegustacion = movimientos.reduce((sum, m) => sum + m.cantidadDegustacion, 0);
    const totalAlianza = movimientos.reduce((sum, m) => sum + m.cantidadAlianza, 0);
    const totalOtro = movimientos.reduce((sum, m) => sum + (m.cantidadOtro || 0), 0);
    const totalIngresos = movimientos.reduce((sum, m) => sum + Number(m.precioTotal), 0);

    return {
      mes,
      anio,
      totalUnidadesVendidas: totalVendidas,
      totalUnidadesDegustacion: totalDegustacion,
      totalUnidadesAlianza: totalAlianza,
      totalUnidadesOtro: totalOtro,
      totalUnidadesMovidas: totalVendidas + totalDegustacion + totalAlianza + totalOtro,
      totalIngresos,
      movimientos,
    };
  }

  // Reporte por producto
  async getReportePorProducto(productoId: number, mes?: number, anio?: number) {
    const queryBuilder = this.movimientosRepository
      .createQueryBuilder('movimiento')
      .leftJoinAndSelect('movimiento.lote', 'lote')
      .leftJoinAndSelect('lote.producto', 'producto')
      .where('producto.idElemento = :productoId', { productoId });

    if (mes && anio) {
      const fechaInicio = new Date(anio, mes - 1, 1);
      const fechaFin = new Date(anio, mes, 0);
      queryBuilder.andWhere('movimiento.fechaMovimiento BETWEEN :fechaInicio AND :fechaFin', {
        fechaInicio,
        fechaFin,
      });
    }

    const movimientos = await queryBuilder.getMany();

    const totalVendidas = movimientos.reduce((sum, m) => sum + m.cantidadVendida, 0);
    const totalDegustacion = movimientos.reduce((sum, m) => sum + m.cantidadDegustacion, 0);
    const totalAlianza = movimientos.reduce((sum, m) => sum + m.cantidadAlianza, 0);
    const totalOtro = movimientos.reduce((sum, m) => sum + (m.cantidadOtro || 0), 0);
    const totalIngresos = movimientos.reduce((sum, m) => sum + Number(m.precioTotal), 0);

    return {
      productoId,
      totalUnidadesVendidas: totalVendidas,
      totalUnidadesDegustacion: totalDegustacion,
      totalUnidadesAlianza: totalAlianza,
      totalUnidadesOtro: totalOtro,
      totalIngresos,
      movimientos,
    };
  }
}
