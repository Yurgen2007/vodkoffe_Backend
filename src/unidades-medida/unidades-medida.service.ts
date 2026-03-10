import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UnidadesMedida } from './entities/unidades-medida.entity';
import { CreateUnidadesMedidaDto, UpdateUnidadesMedidaDto } from './dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UnidadesMedidaService {
  constructor(
    @InjectRepository(UnidadesMedida)
    private readonly unidadRepository:Repository<UnidadesMedida>
  ){}

  async create(createUnidadesMedidaDto: CreateUnidadesMedidaDto):Promise<UnidadesMedida> {
    // Verificar que el nombre no esté duplicado
    const unidadExistente = await this.unidadRepository.findOne({
      where: { nombre: createUnidadesMedidaDto.nombre },
    });
    
    if (unidadExistente) {
      throw new ConflictException(
        `Ya existe una unidad de medida con el nombre "${createUnidadesMedidaDto.nombre}". Por favor use otro nombre.`
      );
    }

    const unidad = this.unidadRepository.create(createUnidadesMedidaDto)
    return await this.unidadRepository.save(unidad)
  }

  async findAll():Promise<UnidadesMedida[]> {
    return await this.unidadRepository.find();
  }

  async findOne(idUnidad: number):Promise<UnidadesMedida | null> {
    const buscarUnidad = await this.unidadRepository.findOneBy({idUnidad})

    if (!idUnidad) {
      throw new Error(`No se encuentra el usuario con el id ${idUnidad}`)
    }
    return buscarUnidad;
  }

  async update(idUnidad: number, updateUnidadesMedidaDto: UpdateUnidadesMedidaDto):Promise<UnidadesMedida> {
    const getUnidadById = await this.unidadRepository.findOneBy({idUnidad});

    if (!getUnidadById) {
      throw new Error(`No existe el elemento con el id ${idUnidad}`)
    }

  Object.assign(getUnidadById, updateUnidadesMedidaDto);

  const updatedUnidad = await this.unidadRepository.save(getUnidadById);
  return updatedUnidad;
  }

  async changeStatus(idUnidad: number):Promise<UnidadesMedida> {
    const getUnidadById = await this.unidadRepository.findOneBy({idUnidad})

    if (!getUnidadById) {
      throw new Error(`No se encontro la unidad con ese id`)
    }

    getUnidadById.estado = !getUnidadById.estado
    
    return this.unidadRepository.save(getUnidadById);
  }

  async remove(idUnidad: number) {
    const unidad = await this.unidadRepository.findOneBy({ idUnidad });
    if (!unidad) {
      throw new Error(`No se encontro la unidad con ese id`);
    }
    await this.unidadRepository.delete(idUnidad);
    return { message: 'Unidad eliminada correctamente' };
  }
}
