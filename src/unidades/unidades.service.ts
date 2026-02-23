import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Unidades, EstadoUnidad } from './entities/unidad.entity';
import { CreateUnidadDto, UpdateUnidadDto } from './dto';
import { 
  RegistrarUnidadesLoteDto, 
  RegistrarUnidadIndividualDto,
  RegistroUnidadesResponseDto,
  UnidadRegistradaResponseDto 
} from './dto/registrar-unidades.dto';
import { Lotes } from '../lotes/entities/lote.entity';
import { Inventarios } from '../inventarios/entities/inventario.entity';
import { Caracteristicas } from '../caracteristicas/entities/caracteristica.entity';

const MAX_UNIDADES_POR_LOTE = 12;

@Injectable()
export class UnidadesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Unidades)
    private readonly unidadesRepository: Repository<Unidades>,
    @InjectRepository(Lotes)
    private readonly lotesRepository: Repository<Lotes>,
    @InjectRepository(Inventarios)
    private readonly inventariosRepository: Repository<Inventarios>,
    @InjectRepository(Caracteristicas)
    private readonly caracteristicasRepository: Repository<Caracteristicas>,
  ) {}

  // ==================== CREAR UNIDAD ====================

  async create(dto: CreateUnidadDto): Promise<Unidades> {
    let lote: Lotes | null = null;
    let loteId: number | null = null;

    // Si se proporciona un lote específico, usarlo
    if (dto.fkLote) {
      lote = await this.lotesRepository.findOne({
        where: { idLote: dto.fkLote },
      });
      if (!lote) {
        throw new NotFoundException(`Lote con ID ${dto.fkLote} no encontrado`);
      }
      // Verificar que el lote no esté lleno
      const unidadesActuales = await this.unidadesRepository.count({ where: { fkLote: dto.fkLote } });
      if (unidadesActuales >= MAX_UNIDADES_POR_LOTE) {
        throw new BadRequestException(`El lote ya está lleno (máximo ${MAX_UNIDADES_POR_LOTE} unidades)`);
      }
      loteId = dto.fkLote;
    } else {
      // Buscar automáticamente un lote con espacio disponible
      const lotesConEspacio = await this.lotesRepository
        .createQueryBuilder('lote')
        .leftJoinAndSelect('lote.unidades', 'unidades')
        .where('lote.estado = :estado', { estado: true })
        .having('COUNT(unidades.idUnidad) < :max', { max: MAX_UNIDADES_POR_LOTE })
        .groupBy('lote.idLote')
        .orderBy('lote.createdAt', 'ASC')
        .getMany();

      if (lotesConEspacio.length === 0) {
        throw new BadRequestException('No hay lotes disponibles con espacio. Cree un nuevo lote primero.');
      }

      // Usar el lote más antiguo con espacio
      lote = lotesConEspacio[0];
      loteId = lote.idLote;
    }

    // Generar código automático si no se proporciona
    const unidadesEnLote = await this.unidadesRepository.count({ where: { fkLote: loteId } });
    const codigoUnidad = dto.codigoUnidad || this.generarCodigoUnidad(lote.codigoLote, unidadesEnLote + 1);

    // Crear unidad
    const unidad = this.unidadesRepository.create({
      codigoUnidad,
      estado: (dto.estado as EstadoUnidad) || 'DISPONIBLE',
      fkLote: loteId,
      fkInventario: dto.fkInventario || null,
      fkCaracteristica: dto.fkCaracteristica || null,
    });

    const unidadGuardada = await this.unidadesRepository.save(unidad);

    // Actualizar cantidad de unidades del lote
    const cantidadActual = await this.unidadesRepository.count({ where: { fkLote: loteId } });
    await this.lotesRepository.update(loteId, { cantidadUnidades: cantidadActual });

    return unidadGuardada;
  }

  // ==================== ACTUALIZAR UNIDAD ====================

  async update(id: number, dto: UpdateUnidadDto): Promise<Unidades> {
    console.log('UPDATE - ID:', id, '- DTO fkLote:', dto.fkLote);
    
    const unidad = await this.findOne(id);
    const loteAnteriorId = unidad.fkLote;
    console.log('Lote Anterior:', loteAnteriorId);
    
    let loteNuevoId: number | null = null;
    let loteCambio = false;
    
    if (dto.codigoUnidad) unidad.codigoUnidad = dto.codigoUnidad;
    if (dto.estado) unidad.estado = dto.estado as EstadoUnidad;
    
    // Procesar el lote si se envió en el DTO y es diferente al actual
    if (dto.fkLote !== undefined && dto.fkLote !== null && dto.fkLote !== loteAnteriorId) {
      console.log('Cambiando lote de', loteAnteriorId, 'a', dto.fkLote);
      const lote = await this.lotesRepository.findOne({ where: { idLote: dto.fkLote } });
      if (!lote) throw new NotFoundException(`Lote con ID ${dto.fkLote} no encontrado`);
      
      // Verificar que el lote no esté lleno
      const unidadesEnNuevoLote = await this.unidadesRepository.count({ where: { fkLote: dto.fkLote } });
      console.log('Unidades en nuevo lote:', unidadesEnNuevoLote);
      if (unidadesEnNuevoLote >= MAX_UNIDADES_POR_LOTE) {
        throw new BadRequestException(`El lote ya está lleno (máximo ${MAX_UNIDADES_POR_LOTE} unidades)`);
      }
      
      loteCambio = true;
      loteNuevoId = dto.fkLote;
      
      // Usar UPDATE directo para evitar problemas con relaciones de TypeORM
      await this.unidadesRepository.update(id, { fkLote: dto.fkLote });
      console.log('UPDATE completado');
      
      // NO llamar a save() aquí porque sobrescribiría el cambio hecho por update()
      // En cambio, obtenemos la unidad actualizada
      const unidadActualizada = await this.findOne(id);
      console.log('Unidad actualizada - fkLote:', unidadActualizada.fkLote);
      
      // Actualizar cantidades de los lotes involucrados
      if (loteAnteriorId) {
        const cantidadAnterior = await this.unidadesRepository.count({ where: { fkLote: loteAnteriorId } });
        await this.lotesRepository.update(loteAnteriorId, { cantidadUnidades: cantidadAnterior });
      }
      const cantidadNueva = await this.unidadesRepository.count({ where: { fkLote: dto.fkLote } });
      await this.lotesRepository.update(dto.fkLote, { cantidadUnidades: cantidadNueva });
      
      return unidadActualizada;
    }
    
    if (dto.fkInventario !== undefined) {
      if (dto.fkInventario) {
        const inv = await this.inventariosRepository.findOne({ where: { idInventario: dto.fkInventario } });
        if (!inv) throw new NotFoundException(`Inventario con ID ${dto.fkInventario} no encontrado`);
      }
      unidad.fkInventario = dto.fkInventario || null;
    }
    if (dto.fkCaracteristica !== undefined) {
      if (dto.fkCaracteristica) {
        const car = await this.caracteristicasRepository.findOne({ where: { idCaracteristica: dto.fkCaracteristica } });
        if (!car) throw new NotFoundException(`Característica con ID ${dto.fkCaracteristica} no encontrada`);
      }
      unidad.fkCaracteristica = dto.fkCaracteristica || null;
    }
    
    // Guardar cambios de otros campos (no lote, porque ya se manejó arriba)
    const unidadGuardada = await this.unidadesRepository.save(unidad);
    return unidadGuardada;
  }

  async findAll(): Promise<Unidades[]> {
    return await this.unidadesRepository.find({
      relations: ['lote', 'inventario', 'caracteristica'],
    });
  }

  async findOne(id: number): Promise<Unidades> {
    const unidad = await this.unidadesRepository.findOne({
      where: { idUnidad: id },
      relations: ['lote', 'inventario', 'caracteristica'],
    });
    if (!unidad) {
      throw new NotFoundException(`Unidad con ID ${id} no encontrada`);
    }
    return unidad;
  }

  // ==================== ELIMINAR ====================

  async remove(id: number): Promise<void> {
    const unidad = await this.findOne(id);
    const loteId = unidad.fkLote;
    
    await this.unidadesRepository.remove(unidad);

    // Actualizar cantidad del lote si la unidad tenía un lote asignado
    if (loteId) {
      const cantidadRestante = await this.unidadesRepository.count({ where: { fkLote: loteId } });
      await this.lotesRepository.update(loteId, { cantidadUnidades: cantidadRestante });
    }
  }

  // ==================== REGISTRO EN LOTES ====================

  async registrarUnidadesEnLote(dto: RegistrarUnidadesLoteDto): Promise<RegistroUnidadesResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verificar lote y contar unidades
      const lote = await queryRunner.manager.findOne(Lotes, {
        where: { idLote: dto.loteId },
        relations: ['unidades'],
      });

      if (!lote) {
        throw new NotFoundException(`El lote con ID ${dto.loteId} no existe`);
      }

      const unidadesActuales = lote.unidades?.length || 0;
      const nuevasUnidades = dto.unidades.length;
      const totalUnidades = unidadesActuales + nuevasUnidades;

      if (totalUnidades > MAX_UNIDADES_POR_LOTE) {
        throw new BadRequestException(
          `El lote ya tiene ${unidadesActuales} unidades. Máximo permitido: ${MAX_UNIDADES_POR_LOTE}`
        );
      }

      // 2. Crear unidades
      const unidadesCreadas: Unidades[] = [];
      
      for (let i = 0; i < dto.unidades.length; i++) {
        const codigoUnidad = this.generarCodigoUnidad(lote.codigoLote, unidadesActuales + i + 1);
        
        const unidad = queryRunner.manager.create(Unidades, {
          codigoUnidad,
          estado: 'DISPONIBLE' as EstadoUnidad,
          fkLote: dto.loteId,
        });

        const savedUnidad = await queryRunner.manager.save(unidad);
        unidadesCreadas.push(savedUnidad);
      }

      // 3. Actualizar cantidad del lote
      lote.cantidadUnidades = totalUnidades;
      await queryRunner.manager.save(lote);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `Se registraron ${unidadesCreadas.length} unidades en el lote ${lote.codigoLote}`,
        totalRegistradas: unidadesCreadas.length,
        unidades: unidadesCreadas.map(u => this.mapToResponseDto(u)),
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async registrarUnidadIndividual(dto: RegistrarUnidadIndividualDto): Promise<UnidadRegistradaResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const lote = await queryRunner.manager.findOne(Lotes, {
        where: { idLote: dto.loteId },
        relations: ['unidades'],
      });

      if (!lote) {
        throw new NotFoundException(`El lote con ID ${dto.loteId} no existe`);
      }

      const unidadesActuales = lote.unidades?.length || 0;
      
      if (unidadesActuales >= MAX_UNIDADES_POR_LOTE) {
        throw new BadRequestException(
          `El lote ya tiene el máximo de ${MAX_UNIDADES_POR_LOTE} unidades`
        );
      }

      const codigoUnidad = this.generarCodigoUnidad(lote.codigoLote, unidadesActuales + 1);
      
      const unidad = queryRunner.manager.create(Unidades, {
        codigoUnidad,
        estado: 'DISPONIBLE' as EstadoUnidad,
        fkLote: dto.loteId,
      });

      const savedUnidad = await queryRunner.manager.save(unidad);

      lote.cantidadUnidades = unidadesActuales + 1;
      await queryRunner.manager.save(lote);

      await queryRunner.commitTransaction();

      return this.mapToResponseDto(savedUnidad);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async obtenerUnidadesPorLote(loteId: number): Promise<UnidadRegistradaResponseDto[]> {
    const lote = await this.lotesRepository.findOne({
      where: { idLote: loteId },
      relations: ['unidades'],
    });

    if (!lote) {
      throw new NotFoundException(`El lote con ID ${loteId} no existe`);
    }

    return (lote.unidades || []).map(u => this.mapToResponseDto(u));
  }

  async verificarLoteCompleto(loteId: number): Promise<{ completo: boolean; unidadesActuales: number; faltantes: number }> {
    const lote = await this.lotesRepository.findOne({
      where: { idLote: loteId },
      relations: ['unidades'],
    });

    if (!lote) {
      throw new NotFoundException(`El lote con ID ${loteId} no existe`);
    }

    const unidadesActuales = lote.unidades?.length || 0;
    
    return {
      completo: unidadesActuales >= MAX_UNIDADES_POR_LOTE,
      unidadesActuales,
      faltantes: Math.max(0, MAX_UNIDADES_POR_LOTE - unidadesActuales),
    };
  }

  // ==================== UTILIDADES ====================

  private generarCodigoUnidad(codigoLote: string, numeroUnidad: number): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${codigoLote}-U${numeroUnidad.toString().padStart(2, '0')}-${timestamp}`;
  }

  private mapToResponseDto(unidad: Unidades): UnidadRegistradaResponseDto {
    return {
      idUnidad: unidad.idUnidad,
      codigoUnidad: unidad.codigoUnidad,
      estado: unidad.estado,
      loteId: unidad.fkLote || 0,
      createdAt: unidad.createdAt,
    };
  }
}
