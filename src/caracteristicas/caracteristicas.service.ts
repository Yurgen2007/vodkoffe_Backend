import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCaracteristicaDto } from './dto/create-caracteristica.dto';
import { UpdateCaracteristicaDto } from './dto/update-caracteristica.dto';
import { Caracteristicas } from './entities/caracteristica.entity';

@Injectable()
export class CaracteristicasService {
  constructor(
    @InjectRepository(Caracteristicas)
    private readonly caracteristicaRepository: Repository<Caracteristicas>,
  ) {}

  async create(createCaracteristicaDto: CreateCaracteristicaDto): Promise<Caracteristicas> {
    const caracteristica = this.caracteristicaRepository.create(createCaracteristicaDto);
    return await this.caracteristicaRepository.save(caracteristica);
  }

  async findAll(): Promise<Caracteristicas[]> {
    return await this.caracteristicaRepository.find();
  }

  async findOne(idCaracteristica: number): Promise<Caracteristicas | null> {
    const caracteristica = await this.caracteristicaRepository.findOne({
      where: { idCaracteristica },
    });

    if (!caracteristica) {
      throw new NotFoundException(
        `No se encontró la característica, el id ${idCaracteristica} no existe`,
      );
    }

    return caracteristica;
  }

  async update(idCaracteristica: number, updateCaracteristicaDto: UpdateCaracteristicaDto) {
    const caracteristica = await this.caracteristicaRepository.findOne({
      where: { idCaracteristica },
    });

    if (!caracteristica) {
      throw new NotFoundException(
        `No se encontró la característica, el id ${idCaracteristica} no existe`,
      );
    }

    Object.assign(caracteristica, updateCaracteristicaDto);
    await this.caracteristicaRepository.save(caracteristica);

    return { status: 200, message: 'Datos actualizados con éxito' };
  }

  async changeStatus(idCaracteristica: number) {
    const caracteristica = await this.caracteristicaRepository.findOneBy({
      idCaracteristica,
    });

    if (!caracteristica) {
      throw new NotFoundException(
        `No se encontró la característica, el id ${idCaracteristica} no existe`,
      );
    }

    caracteristica.estado = !caracteristica.estado;
    return await this.caracteristicaRepository.save(caracteristica);
  }

  async remove(idCaracteristica: number) {
    const caracteristica = await this.caracteristicaRepository.findOne({
      where: { idCaracteristica },
    });

    if (!caracteristica) {
      throw new NotFoundException(
        `No se encontró la característica, el id ${idCaracteristica} no existe`,
      );
    }

    return await this.caracteristicaRepository.remove(caracteristica);
  }
}
