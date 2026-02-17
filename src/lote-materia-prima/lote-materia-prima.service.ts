import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoteMateriaPrima } from './entities/lote-materia-prima.entity';
import { CreateLoteMateriaPrimaDto, UpdateLoteMateriaPrimaDto } from './dto';
import { Lotes } from '../lotes/entities/lote.entity';
import { MateriasPrimas } from '../materias-primas/entities/materia-prima.entity';

@Injectable()
export class LoteMateriaPrimaService {
  constructor(
    @InjectRepository(LoteMateriaPrima)
    private readonly loteMateriaPrimaRepository: Repository<LoteMateriaPrima>,
    @InjectRepository(Lotes)
    private readonly lotesRepository: Repository<Lotes>,
    @InjectRepository(MateriasPrimas)
    private readonly materiasPrimasRepository: Repository<MateriasPrimas>,
  ) {}

  async create(createDto: CreateLoteMateriaPrimaDto): Promise<LoteMateriaPrima> {
    const lote = await this.lotesRepository.findOne({
      where: { idLote: createDto.fkLote },
    });
    if (!lote) {
      throw new NotFoundException(`Lote con ID ${createDto.fkLote} no encontrado`);
    }

    const materiaPrima = await this.materiasPrimasRepository.findOne({
      where: { idMateriaPrima: createDto.fkMateriaPrima },
    });
    if (!materiaPrima) {
      throw new NotFoundException(`Materia prima con ID ${createDto.fkMateriaPrima} no encontrada`);
    }

    const loteMateriaPrima = this.loteMateriaPrimaRepository.create({
      cantidad: createDto.cantidad,
      costoUnitario: createDto.costoUnitario,
      costoTotal: createDto.cantidad * createDto.costoUnitario,
      lote,
      materiaPrima,
    });

    return this.loteMateriaPrimaRepository.save(loteMateriaPrima);
  }

  findAll(): Promise<LoteMateriaPrima[]> {
    return this.loteMateriaPrimaRepository.find({
      relations: ['lote', 'materiaPrima'],
    });
  }

  async findOne(id: number): Promise<LoteMateriaPrima> {
    const loteMateriaPrima = await this.loteMateriaPrimaRepository.findOne({
      where: { idLoteMateriaPrima: id },
      relations: ['lote', 'materiaPrima'],
    });
    if (!loteMateriaPrima) {
      throw new NotFoundException(`Registro con ID ${id} no encontrado`);
    }
    return loteMateriaPrima;
  }

  async update(id: number, updateDto: UpdateLoteMateriaPrimaDto): Promise<LoteMateriaPrima> {
    const loteMateriaPrima = await this.findOne(id);
    this.loteMateriaPrimaRepository.merge(loteMateriaPrima, updateDto);
    return this.loteMateriaPrimaRepository.save(loteMateriaPrima);
  }

  async remove(id: number): Promise<void> {
    const loteMateriaPrima = await this.findOne(id);
    await this.loteMateriaPrimaRepository.remove(loteMateriaPrima);
  }
}