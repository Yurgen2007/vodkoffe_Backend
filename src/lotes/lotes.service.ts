import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Lotes } from './entities/lote.entity';
import { CreateLoteDto, UpdateLoteDto } from './dto';
import { LoteMateriaPrima } from '../lote-materia-prima/entities/lote-materia-prima.entity';
import { MateriasPrimas } from '../materias-primas/entities/materia-prima.entity';
import { Unidades, EstadoUnidad } from '../unidades/entities/unidad.entity';

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
      return savedLote;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll(): Promise<Lotes[]> {
    return this.loteRepository.find({
      relations: ['unidades', 'materiasPrimas', 'materiasPrimas.materiaPrima'],
    });
  }

  async findOne(id: number): Promise<Lotes> {
    const lote = await this.loteRepository.findOne({
      where: { idLote: id },
      relations: ['unidades', 'materiasPrimas', 'materiasPrimas.materiaPrima'],
    });
    if (!lote) {
      throw new NotFoundException(`Lote con ID ${id} no encontrado`);
    }
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
}
