import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IsNumber, IsString, IsOptional, Min, ValidateNested, IsArray, IsInt } from 'class-validator';
import { Type, plainToInstance } from 'class-transformer';

import { Lotes } from './entities/lote.entity';
import { CreateLoteDto, UpdateLoteDto } from './dto';
import { LoteMateriaPrima } from '../lote-materia-prima/entities/lote-materia-prima.entity';
import { MateriasPrimas } from '../materias-primas/entities/materia-prima.entity';
import { Unidades, EstadoUnidad } from '../unidades/entities/unidad.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

// DTO para crear materias primas con un lote
class MateriaPrimaConCantidadDto {
  @IsString()
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsNumber()
  @Min(0)
  costoUnitario!: number;

  @IsOptional()
  @IsInt()
  fkUnidadMedida?: number;
}

export class CreateMateriasPrimasConLoteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MateriaPrimaConCantidadDto)
  materiasPrimas!: MateriaPrimaConCantidadDto[];

  @IsInt()
  fkLote!: number;
}

@Injectable()
export class LotesService {
  constructor(
    @InjectRepository(Lotes)
    private readonly loteRepository: Repository<Lotes>,
    @InjectRepository(LoteMateriaPrima)
    private readonly loteMateriaPrimaRepository: Repository<LoteMateriaPrima>,
    @InjectRepository(MateriasPrimas)
    private readonly materiasPrimasRepository: Repository<MateriasPrimas>,
    @InjectRepository(Unidades)
    private readonly unidadesRepository: Repository<Unidades>,
    private dataSource: DataSource,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async create(createLoteDto: CreateLoteDto): Promise<Lotes> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear el lote
      const cantidadUnidades = createLoteDto.cantidadUnidades || 0;
      const lote = this.loteRepository.create({
        ...createLoteDto,
        cantidadUnidades,
        costoTotal: cantidadUnidades * createLoteDto.costoUnitario,
        costoMateriasPrimas: 0,
      });
      const savedLote = await queryRunner.manager.save(lote);

      // Crear las unidades del lote
      if (cantidadUnidades > 0) {
        for (let i = 1; i <= cantidadUnidades; i++) {
          const codigoUnidad = `${savedLote.codigoLote}-U${i.toString().padStart(2, '0')}`;
          const unidad = this.unidadesRepository.create({
            codigoUnidad,
            estado: 'DISPONIBLE' as EstadoUnidad,
            fkLote: savedLote.idLote,
          });
          await queryRunner.manager.save(unidad);
        }
      }

      // Registrar materias primas del lote
      let costoTotalMateriasPrimas = 0;
      if (createLoteDto.materiasPrimas && createLoteDto.materiasPrimas.length > 0) {
        for (const mp of createLoteDto.materiasPrimas) {
          const materiaPrima = await this.materiasPrimasRepository.findOne({
            where: { idMateriaPrima: mp.idMateriaPrima },
          });
          if (!materiaPrima) {
            throw new NotFoundException(`Materia prima con ID ${mp.idMateriaPrima} no encontrada`);
          }

          const loteMateriaPrima = this.loteMateriaPrimaRepository.create({
            lote: savedLote,
            materiaPrima: materiaPrima,
            cantidad: mp.cantidad,
            costoUnitario: mp.costoUnitario,
            costoTotal: mp.cantidad * mp.costoUnitario,
          });
          await queryRunner.manager.save(loteMateriaPrima);
          costoTotalMateriasPrimas += mp.cantidad * mp.costoUnitario;
        }

        // Actualizar costo de materias primas del lote
        savedLote.costoMateriasPrimas = costoTotalMateriasPrimas;
        await queryRunner.manager.save(savedLote);
      }

      await queryRunner.commitTransaction();
      
      // Verificar si el lote está por vencer y enviar notificación
      if (savedLote.fechaVencimiento) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaVenc = new Date(savedLote.fechaVencimiento);
        fechaVenc.setHours(0, 0, 0, 0);
        const diasRestantes = Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diasRestantes > 0 && diasRestantes <= 15) {
          console.log(`🔔 Lote ${savedLote.codigoLote} está por vencer en ${diasRestantes} días - enviando notificación...`);
          await this.notificacionesService.notificarUnLotePorVencer(savedLote);
        }
      }
      
      // Verificar si el lote tiene stock bajo (≤5 unidades)
      if (savedLote.cantidadUnidades !== null && savedLote.cantidadUnidades <= 5 && savedLote.cantidadUnidades > 0) {
        console.log(`📦 Lote ${savedLote.codigoLote} tiene stock bajo (${savedLote.cantidadUnidades} unidades) - enviando notificación...`);
        await this.notificacionesService.notificarUnLoteStockBajo(savedLote);
      }
      
      return savedLote;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Lotes[]> {
    const lotes = await this.loteRepository.find({
      relations: ['unidades', 'materiasPrimas', 'materiasPrimas.materiaPrima', 'movimientos'],
    });
    
    // Calcular cantidadActual y cantidadTotal para cada lote
    return lotes.map(lote => {
      // cantidadActual: unidades disponibles (calculado de la relación)
      const disponibles = lote.unidades?.filter(u => u.estado === 'DISPONIBLE').length || 0;
      // cantidadTotal: total de unidades en el lote
      const total = lote.unidades?.length || lote.cantidadUnidades || 0;
      
      (lote as any).cantidadActual = disponibles;
      (lote as any).cantidadTotal = total;
      return lote;
    });
  }

  private calcularCantidadActual(lote: Lotes): number {
    // Calcular la cantidad total de unidades Movidas (vendidas + degustación + alianza)
    const cantidadMovida = lote.movimientos?.reduce((total, m) => {
      return total + (m.cantidadVendida || 0) + (m.cantidadDegustacion || 0) + (m.cantidadAlianza || 0);
    }, 0) || 0;
    
    // La cantidad actual es la cantidad original menos lo movido
    return Math.max(0, (lote.cantidadUnidades || 0) - cantidadMovida);
  }

  /**
   * Verifica y corrige la cantidad de unidades de un lote basándose en la tabla de unidades
   * Ahora cuenta solo las unidades con estado DISPONIBLE
   * Returns: { corrected: boolean, cantidadAnterior: number, cantidadNueva: number }
   */
  async verificarYCorrigirCantidadUnidades(loteId: number): Promise<{ corrected: boolean; cantidadAnterior: number; cantidadNueva: number }> {
    const lote = await this.loteRepository.findOne({ 
      where: { idLote: loteId },
      relations: ['unidades']
    });
    
    if (!lote) {
      throw new NotFoundException(`Lote con ID ${loteId} no encontrado`);
    }
    
    // Contar solo las unidades con estado DISPONIBLE
    const unidadesDisponibles = await this.unidadesRepository.count({
      where: { fkLote: loteId, estado: 'DISPONIBLE' }
    });
    
    const cantidadAnterior = lote.cantidadUnidades || 0;
    
    // Si hay discrepancia, corregir
    if (unidadesDisponibles !== cantidadAnterior) {
      console.log(`⚠️ Corrección de cantidad para lote ${lote.codigoLote}: ${cantidadAnterior} -> ${unidadesDisponibles}`);
      await this.loteRepository.update(loteId, { cantidadUnidades: unidadesDisponibles });
      return { corrected: true, cantidadAnterior, cantidadNueva: unidadesDisponibles };
    }
    
    return { corrected: false, cantidadAnterior, cantidadNueva: unidadesDisponibles };
  }

  /**
   * Verifica y corrige la cantidad de unidades de TODOS los lotes
   */
  async verificarTodosLosLotes(): Promise<{ totalLotes: number; corregidos: number; detalles: any[] }> {
    const lotes = await this.loteRepository.find({ where: { estado: true } });
    const detalles: any[] = [];
    let corregidos = 0;
    
    for (const lote of lotes) {
      const resultado = await this.verificarYCorrigirCantidadUnidades(lote.idLote);
      if (resultado.corrected) {
        corregidos++;
        detalles.push({
          codigoLote: lote.codigoLote,
          ...resultado
        });
      }
    }
    
    return { totalLotes: lotes.length, corregidos, detalles };
  }

  async findOne(id: number): Promise<Lotes> {
    const lote = await this.loteRepository.findOne({
      where: { idLote: id },
      relations: ['unidades', 'materiasPrimas', 'materiasPrimas.materiaPrima', 'movimientos'],
    });
    if (!lote) {
      throw new NotFoundException(`Lote con ID ${id} no encontrado`);
    }
    
    // Calcular cantidadActual y cantidadTotal para el lote
    const disponibles = lote.unidades?.filter(u => u.estado === 'DISPONIBLE').length || 0;
    const total = lote.unidades?.length || lote.cantidadUnidades || 0;
    
    (lote as any).cantidadActual = disponibles;
    (lote as any).cantidadTotal = total;
    
    return lote;
  }

  async update(id: number, updateLoteDto: UpdateLoteDto): Promise<Lotes> {
    const lote = await this.findOne(id);
    this.loteRepository.merge(lote, updateLoteDto);
    return this.loteRepository.save(lote);
  }

  async remove(id: number): Promise<void> {
    const lote = await this.findOne(id);
    await this.loteRepository.remove(lote);
  }

  // Obtener resumen de costos del lote
  async getResumenCostos(id: number) {
    const lote = await this.findOne(id);
    return {
      codigoLote: lote.codigoLote,
      cantidadUnidades: lote.cantidadUnidades,
      costoUnitario: lote.costoUnitario,
      costoTotalLote: lote.costoTotal,
      costoMateriasPrimas: lote.costoMateriasPrimas,
      costoTotalProduccion: lote.costoTotal + lote.costoMateriasPrimas,
    };
  }

  // Crear múltiples materias primas y asociarlas a un lote existente
  async crearMateriasPrimasConLote(createDto: CreateMateriasPrimasConLoteDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const lote = await this.loteRepository.findOne({
        where: { idLote: createDto.fkLote },
      });

      if (!lote) {
        throw new NotFoundException(`Lote con ID ${createDto.fkLote} no encontrado`);
      }

      let costoTotalMateriasPrimas = 0;
      const materiasCreadas: any[] = [];

      for (const mp of createDto.materiasPrimas) {
        // Buscar o crear la materia prima
        let materiaPrima = await this.materiasPrimasRepository.findOne({
          where: { nombre: mp.nombre },
        });

        if (!materiaPrima) {
          // Crear nueva materia prima
          materiaPrima = this.materiasPrimasRepository.create({
            nombre: mp.nombre,
            descripcion: mp.descripcion || '',
            costoUnitario: mp.costoUnitario,
            estado: true,
            unidadMedida: mp.fkUnidadMedida ? { idUnidad: mp.fkUnidadMedida } as any : undefined,
          });
          materiaPrima = await queryRunner.manager.save(materiaPrima);
        }

        // Crear la relación con el lote
        const loteMateriaPrima = this.loteMateriaPrimaRepository.create({
          lote: lote,
          materiaPrima: materiaPrima,
          cantidad: mp.cantidad,
          costoUnitario: mp.costoUnitario,
          costoTotal: mp.cantidad * mp.costoUnitario,
        });
        await queryRunner.manager.save(loteMateriaPrima);

        costoTotalMateriasPrimas += mp.cantidad * mp.costoUnitario;
        materiasCreadas.push({
          idMateriaPrima: materiaPrima.idMateriaPrima,
          nombre: materiaPrima.nombre,
          cantidad: mp.cantidad,
          costoUnitario: mp.costoUnitario,
          costoTotal: mp.cantidad * mp.costoUnitario,
        });
      }

      // Actualizar el costo total de materias primas del lote
      lote.costoMateriasPrimas = (lote.costoMateriasPrimas || 0) + costoTotalMateriasPrimas;
      await queryRunner.manager.save(lote);

      await queryRunner.commitTransaction();

      return {
        lote: lote,
        materiasPrimas: materiasCreadas,
        costoTotalMateriasPrimas: costoTotalMateriasPrimas,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
