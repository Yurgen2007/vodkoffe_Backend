import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { Unidades, EstadoUnidad } from './entities/unidad.entity';
import { CreateUnidadDto, UpdateUnidadDto } from './dto';
import { 
  RegistrarUnidadesLoteDto, 
  RegistrarUnidadIndividualDto,
  RegistroUnidadesResponseDto,
  UnidadRegistradaResponseDto 
} from './dto/registrar-unidades.dto';
import { Lotes } from '../lotes/entities/lote.entity';

const MAX_UNIDADES_POR_LOTE = 12;

@Injectable()
export class UnidadesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Unidades)
    private readonly unidadesRepository: Repository<Unidades>,
    @InjectRepository(Lotes)
    private readonly lotesRepository: Repository<Lotes>,
  ) {}

  /**
   * Registra múltiples unidades en un lote de forma transaccional
   * Valida: existencia del lote, límite de 12 unidades, identificadores únicos
   */
  async registrarUnidadesEnLote(dto: RegistrarUnidadesLoteDto): Promise<RegistroUnidadesResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verificar que el lote existe
      const lote = await queryRunner.manager.findOne(Lotes, {
        where: { idLote: dto.loteId },
        relations: ['unidades'],
      });

      if (!lote) {
        throw new NotFoundException(`El lote con ID ${dto.loteId} no existe`);
      }

      // 2. Verificar que no se exceda el límite de 12 unidades
      const unidadesActuales = lote.unidades?.length || 0;
      const nuevasUnidades = dto.unidades.length;
      const totalUnidades = unidadesActuales + nuevasUnidades;

      if (totalUnidades > MAX_UNIDADES_POR_LOTE) {
        throw new BadRequestException(
          `El lote ya tiene ${unidadesActuales} unidades. ` +
          `No se pueden agregar ${nuevasUnidades} más. ` +
          `Máximo permitido: ${MAX_UNIDADES_POR_LOTE} unidades por lote.`
        );
      }

      // 3. Verificar que no haya identificadores duplicados en el request
      const identificadoresRequest = dto.unidades.map(u => u.identificadorUsuario);
      const duplicadosRequest = identificadoresRequest.filter(
        (item, index) => identificadoresRequest.indexOf(item) !== index
      );

      if (duplicadosRequest.length > 0) {
        throw new ConflictException(
          `Identificadores duplicados en la solicitud: ${duplicadosRequest.join(', ')}`
        );
      }

      // 4. Verificar que los identificadores no existan en la base de datos
      const identificadoresExistentes = await queryRunner.manager
        .createQueryBuilder(Unidades, 'unidad')
        .where('unidad.identificadorUsuario IN (:...identificadores)', { 
          identificadores: identificadoresRequest 
        })
        .getMany();

      if (identificadoresExistentes.length > 0) {
        const idsDuplicados = identificadoresExistentes.map(u => u.identificadorUsuario).join(', ');
        throw new ConflictException(
          `Los siguientes identificadores ya están registrados: ${idsDuplicados}`
        );
      }

      // 5. Crear las unidades
      const unidadesCreadas: Unidades[] = [];
      
      for (const unidadDto of dto.unidades) {
        const codigoUnidad = this.generarCodigoUnidad(lote.codigoLote, unidadesActuales + unidadesCreadas.length + 1);
        
        const unidad = queryRunner.manager.create(Unidades, {
          codigoUnidad,
          identificadorUsuario: unidadDto.identificadorUsuario,
          estado: 'DISPONIBLE' as EstadoUnidad,
          lote,
        });

        const savedUnidad = await queryRunner.manager.save(unidad);
        unidadesCreadas.push(savedUnidad);
      }

      // 6. Actualizar cantidad de unidades en el lote
      lote.cantidadUnidades = totalUnidades;
      await queryRunner.manager.save(lote);

      // 7. Confirmar transacción
      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `Se registraron ${unidadesCreadas.length} unidades exitosamente en el lote ${lote.codigoLote}`,
        totalRegistradas: unidadesCreadas.length,
        unidades: unidadesCreadas.map(u => this.mapToResponseDto(u)),
      };

    } catch (error) {
      // Rollback en caso de error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Registra una sola unidad en un lote existente
   */
  async registrarUnidadIndividual(dto: RegistrarUnidadIndividualDto): Promise<UnidadRegistradaResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verificar que el lote existe
      const lote = await queryRunner.manager.findOne(Lotes, {
        where: { idLote: dto.loteId },
        relations: ['unidades'],
      });

      if (!lote) {
        throw new NotFoundException(`El lote con ID ${dto.loteId} no existe`);
      }

      // 2. Verificar límite de 12 unidades
      const unidadesActuales = lote.unidades?.length || 0;
      
      if (unidadesActuales >= MAX_UNIDADES_POR_LOTE) {
        throw new BadRequestException(
          `El lote ya tiene el máximo de ${MAX_UNIDADES_POR_LOTE} unidades permitidas`
        );
      }

      // 3. Verificar que el identificador no exista
      const unidadExistente = await queryRunner.manager.findOne(Unidades, {
        where: { identificadorUsuario: dto.identificadorUsuario },
      });

      if (unidadExistente) {
        throw new ConflictException(
          `El identificador "${dto.identificadorUsuario}" ya está registrado`
        );
      }

      // 4. Crear la unidad
      const codigoUnidad = this.generarCodigoUnidad(lote.codigoLote, unidadesActuales + 1);
      
      const unidad = queryRunner.manager.create(Unidades, {
        codigoUnidad,
        identificadorUsuario: dto.identificadorUsuario,
        estado: 'DISPONIBLE' as EstadoUnidad,
        lote,
      });

      const savedUnidad = await queryRunner.manager.save(unidad);

      // 5. Actualizar cantidad en el lote
      lote.cantidadUnidades = unidadesActuales + 1;
      await queryRunner.manager.save(lote);

      // 6. Confirmar transacción
      await queryRunner.commitTransaction();

      return this.mapToResponseDto(savedUnidad);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene todas las unidades de un lote específico
   */
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

  /**
   * Verifica si un lote está completo (12 unidades)
   */
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

  /**
   * Genera un código único para la unidad
   */
  private generarCodigoUnidad(codigoLote: string, numeroUnidad: number): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${codigoLote}-U${numeroUnidad.toString().padStart(2, '0')}-${timestamp}`;
  }

  /**
   * Mapea una entidad a DTO de respuesta
   */
  private mapToResponseDto(unidad: Unidades): UnidadRegistradaResponseDto {
    return {
      idUnidad: unidad.idUnidad,
      codigoUnidad: unidad.codigoUnidad,
      identificadorUsuario: unidad.identificadorUsuario,
      estado: unidad.estado,
      loteId: unidad.lote?.idLote,
      createdAt: unidad.createdAt,
    };
  }

  // Métodos CRUD originales
  async create(createUnidadDto: CreateUnidadDto): Promise<Unidades> {
    const lote = await this.lotesRepository.findOne({
      where: { idLote: createUnidadDto.fkLote },
    });
    if (!lote) {
      throw new NotFoundException(`Lote con ID ${createUnidadDto.fkLote} no encontrado`);
    }

    const unidad = this.unidadesRepository.create({
      codigoUnidad: createUnidadDto.codigoUnidad,
      estado: (createUnidadDto.estado as EstadoUnidad) || 'DISPONIBLE',
      lote,
    });
    return this.unidadesRepository.save(unidad);
  }

  findAll(): Promise<Unidades[]> {
    return this.unidadesRepository.find({
      relations: ['lote'],
    });
  }

  async findOne(id: number): Promise<Unidades> {
    const unidad = await this.unidadesRepository.findOne({
      where: { idUnidad: id },
      relations: ['lote'],
    });
    if (!unidad) {
      throw new NotFoundException(`Unidad con ID ${id} no encontrada`);
    }
    return unidad;
  }

  async update(id: number, updateUnidadDto: UpdateUnidadDto): Promise<Unidades> {
    const unidad = await this.findOne(id);
    
    if (updateUnidadDto.codigoUnidad) {
      unidad.codigoUnidad = updateUnidadDto.codigoUnidad;
    }
    if (updateUnidadDto.estado) {
      unidad.estado = updateUnidadDto.estado as EstadoUnidad;
    }
    if (updateUnidadDto.fkLote) {
      const lote = await this.lotesRepository.findOne({
        where: { idLote: updateUnidadDto.fkLote },
      });
      if (!lote) {
        throw new NotFoundException(`Lote con ID ${updateUnidadDto.fkLote} no encontrado`);
      }
      unidad.lote = lote;
    }
    
    return this.unidadesRepository.save(unidad);
  }

  async remove(id: number): Promise<void> {
    const unidad = await this.findOne(id);
    await this.unidadesRepository.remove(unidad);
  }
}
