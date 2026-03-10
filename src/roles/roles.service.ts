import { Injectable, ConflictException } from '@nestjs/common';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { Roles } from './entities/role.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private readonly rolRepository: Repository<Roles>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Roles> {
    // Verificar que el nombre no esté duplicado
    const rolExistente = await this.rolRepository.findOne({
      where: { nombre: createRoleDto.nombre },
    });
    
    if (rolExistente) {
      throw new ConflictException(
        `Ya existe un rol con el nombre "${createRoleDto.nombre}". Por favor use otro nombre.`
      );
    }

    const rol = this.rolRepository.create(createRoleDto);
    return await this.rolRepository.save(rol);
  }

  async findAll(): Promise<Roles[]> {
    return await this.rolRepository.find();
  }

  async findOne(idRol: number): Promise<Roles | null> {
    const getRolById = await this.rolRepository.findOneBy({ idRol });
    if (!getRolById) {
      throw new Error(`El rol con el id ${idRol} no existe`);
    }
    return getRolById;
  }

  async update(idRol: number, updateRoleDto: UpdateRoleDto): Promise<Roles> {
    const getRolById = await this.rolRepository.findOneBy({
      idRol,
    });

    if (!getRolById) {
      throw new Error(`El rol con el id ${idRol} no existe`);
    }

  Object.assign(getRolById, updateRoleDto);

  const updatedRol = await this.rolRepository.save(getRolById);
  return updatedRol;
  }

  async changeStatus(idRol: number): Promise<Roles> {
    const getRolById = await this.rolRepository.findOneBy({ idRol });
    if (!getRolById) {
      throw new Error(`El rol con el id ${idRol} no existe`);
    }

    getRolById.estado = !getRolById.estado;

    return this.rolRepository.save(getRolById);
  }

  async remove(idRol: number) {
    const rol = await this.rolRepository.findOneBy({ idRol });
    if (!rol) {
      throw new Error(`El rol con el id ${idRol} no existe`);
    }
    await this.rolRepository.delete(idRol);
    return { message: 'Rol eliminado correctamente' };
  }
}
