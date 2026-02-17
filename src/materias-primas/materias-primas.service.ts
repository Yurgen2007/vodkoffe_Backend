import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMateriaPrimaDto } from './dto/create-materia-prima.dto';
import { UpdateMateriaPrimaDto } from './dto/update-materia-prima.dto';
import { MateriasPrimas } from './entities/materia-prima.entity';

@Injectable()
export class MateriasPrimasService {
  constructor(
    @InjectRepository(MateriasPrimas)
    private readonly materiaPrimaRepository: Repository<MateriasPrimas>,
  ) {}

  async create(createMateriaPrimaDto: CreateMateriaPrimaDto): Promise<MateriasPrimas> {
    const materiaPrima = this.materiaPrimaRepository.create({
      nombre: createMateriaPrimaDto.nombre,
      descripcion: createMateriaPrimaDto.descripcion,
      costoUnitario: createMateriaPrimaDto.costoUnitario || 0,
      estado: createMateriaPrimaDto.estado ?? true,
    });
    return await this.materiaPrimaRepository.save(materiaPrima);
  }

  async findAll(): Promise<MateriasPrimas[]> {
    return await this.materiaPrimaRepository.find({
      relations: ['unidadMedida'],
    });
  }

  async findOne(idMateriaPrima: number): Promise<MateriasPrimas | null> {
    const materiaPrima = await this.materiaPrimaRepository.findOne({
      where: { idMateriaPrima },
      relations: ['unidadMedida'],
    });

    if (!materiaPrima) {
      throw new NotFoundException(
        `No se encontró la materia prima, el id ${idMateriaPrima} no existe`,
      );
    }

    return materiaPrima;
  }

  async update(idMateriaPrima: number, updateMateriaPrimaDto: UpdateMateriaPrimaDto) {
    const materiaPrima = await this.materiaPrimaRepository.findOne({
      where: { idMateriaPrima },
    });

    if (!materiaPrima) {
      throw new NotFoundException(
        `No se encontró la materia prima, el id ${idMateriaPrima} no existe`,
      );
    }

    Object.assign(materiaPrima, updateMateriaPrimaDto);
    await this.materiaPrimaRepository.save(materiaPrima);

    return { status: 200, message: 'Datos actualizados con éxito' };
  }

  async changeStatus(idMateriaPrima: number) {
    const materiaPrima = await this.materiaPrimaRepository.findOneBy({
      idMateriaPrima,
    });

    if (!materiaPrima) {
      throw new NotFoundException(
        `No se encontró la materia prima, el id ${idMateriaPrima} no existe`,
      );
    }

    materiaPrima.estado = !materiaPrima.estado;
    return await this.materiaPrimaRepository.save(materiaPrima);
  }

  async remove(idMateriaPrima: number) {
    const materiaPrima = await this.materiaPrimaRepository.findOne({
      where: { idMateriaPrima },
    });

    if (!materiaPrima) {
      throw new NotFoundException(
        `No se encontró la materia prima, el id ${idMateriaPrima} no existe`,
      );
    }

    return await this.materiaPrimaRepository.remove(materiaPrima);
  }
}
