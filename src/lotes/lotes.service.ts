import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Lotes } from './entities/lote.entity';
import { CreateLoteDto, UpdateLoteDto } from './dto';
import { Productos } from '../productos/entities/producto.entity';
import { LoteMateriaPrima } from '../lote-materia-prima/entities/lote-materia-prima.entity';
import { MateriasPrimas } from '../materias-primas/entities/materia-prima.entity';

@Injectable()
export class LotesService {
  constructor(
    @InjectRepository(Lotes)
    private readonly loteRepository: Repository<Lotes>,
    @InjectRepository(Productos)
    private readonly productosRepository: Repository<Productos>,
    @InjectRepository(LoteMateriaPrima)
    private readonly loteMateriaPrimaRepository: Repository<LoteMateriaPrima>,
    @InjectRepository(MateriasPrimas)
    private readonly materiasPrimasRepository: Repository<MateriasPrimas>,
    private dataSource: DataSource,
  ) {}

  async create(createLoteDto: CreateLoteDto): Promise<Lotes> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar que el producto existe
      const producto = await this.productosRepository.findOne({
        where: { idProducto: createLoteDto.fkProducto },
      });
      if (!producto) {
        throw new NotFoundException(`Producto con ID ${createLoteDto.fkProducto} no encontrado`);
      }

      // Crear el lote
      const lote = this.loteRepository.create({
        ...createLoteDto,
        producto: producto,
        costoTotal: createLoteDto.cantidadUnidades * createLoteDto.costoUnitario,
        costoMateriasPrimas: 0,
      });
      const savedLote = await queryRunner.manager.save(lote);

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
      relations: ['producto', 'unidades', 'materiasPrimas', 'materiasPrimas.materiaPrima'],
    });
  }

  async findOne(id: number): Promise<Lotes> {
    const lote = await this.loteRepository.findOne({
      where: { idLote: id },
      relations: ['producto', 'unidades', 'materiasPrimas', 'materiasPrimas.materiaPrima'],
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
