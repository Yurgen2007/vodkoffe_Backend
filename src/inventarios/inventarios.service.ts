import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AgregarStockDto,
  CreateInventarioDto,
  UpdateInventarioDto,
} from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventarios } from './entities/inventario.entity';
import { Repository } from 'typeorm';


@Injectable()
export class InventariosService {
  constructor(
    @InjectRepository(Inventarios)
    private readonly inventarioRepository: Repository<Inventarios>,
  ) { }

  async create(createInventarioDto: CreateInventarioDto): Promise<Inventarios> {
    const inventario = this.inventarioRepository.create(createInventarioDto);
    return await this.inventarioRepository.save(inventario);
  }

  async findAll(): Promise<Inventarios[]> {
    return await this.inventarioRepository.find();
  }

  async findOne(idInventario: number): Promise<Inventarios | null> {
    const inventario = await this.inventarioRepository.findOne({
      where: { idInventario },
    });

    if (!inventario) {
      throw new NotFoundException(`No se encontró el inventario con id ${idInventario}`);
    }

    return inventario;
  }

  async update(
    idInventario: number,
    updateInventarioDto: UpdateInventarioDto,
  ): Promise<Inventarios> {
    const inventario = await this.findOne(idInventario);
    if (!inventario) throw new NotFoundException('Inventario no encontrado');

    const updated = await this.inventarioRepository.save({
      ...inventario,
      ...updateInventarioDto,
    });

    return updated;
  }

  async changeStatus(idInventario: number): Promise<Inventarios> {
    const inventario = await this.findOne(idInventario);
    if (!inventario) throw new NotFoundException('Inventario no encontrado');

    inventario.estado = !inventario.estado;
    return await this.inventarioRepository.save(inventario);
  }

  async remove(idInventario: number): Promise<void> {
    const inventario = await this.findOne(idInventario);
    if (!inventario) throw new NotFoundException('Inventario no encontrado');

    await this.inventarioRepository.remove(inventario);
  }
}
