import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Productos } from './entities/producto.entity';
import { Caracteristicas } from '../caracteristicas/entities/caracteristica.entity';
import { UnidadesMedida } from '../unidades-medida/entities/unidades-medida.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Productos)
    private readonly productoRepository: Repository<Productos>,
    @InjectRepository(Caracteristicas)
    private readonly caracteristicasRepository: Repository<Caracteristicas>,
    @InjectRepository(UnidadesMedida)
    private readonly unidadesMedidaRepository: Repository<UnidadesMedida>,
  ) {}

  async create(
    createProductoDto: CreateProductoDto,
    filename?: string,
  ): Promise<Productos> {
    // Validar unidad de medida si viene
    if (createProductoDto.fkUnidadMedida) {
      const unidadMedida = await this.unidadesMedidaRepository.findOne({
        where: { idUnidad: createProductoDto.fkUnidadMedida },
      });
      if (!unidadMedida) {
        throw new BadRequestException('La unidad de medida no existe');
      }
    }

    // Validar característica si viene
    if (createProductoDto.fkCaracteristica) {
      const caracteristica = await this.caracteristicasRepository.findOne({
        where: { idCaracteristica: createProductoDto.fkCaracteristica },
      });
      if (!caracteristica) {
        throw new BadRequestException('La característica no existe');
      }
    }

    const producto = this.productoRepository.create({
      codigo: createProductoDto.codigo,
      nombre: createProductoDto.nombre,
      descripcion: createProductoDto.descripcion,
      imagen: filename ?? createProductoDto.imagen ?? 'defaultProducto.png',
      estado: true,
      fkCaracteristica: createProductoDto.fkCaracteristica
        ? { idCaracteristica: createProductoDto.fkCaracteristica }
        : undefined,
      fkUnidadMedida: createProductoDto.fkUnidadMedida
        ? { idUnidad: createProductoDto.fkUnidadMedida }
        : undefined,
    });

    return await this.productoRepository.save(producto);
  }

  async findAll(): Promise<Productos[]> {
    return await this.productoRepository.find({
      relations: ['fkUnidadMedida', 'fkCaracteristica', 'lotes'],
    });
  }

  async findOne(idProducto: number): Promise<Productos | null> {
    const getProductoById = await this.productoRepository.findOne({
      where: { idProducto },
      relations: ['fkUnidadMedida', 'fkCaracteristica', 'lotes'],
    });

    if (!getProductoById) {
      throw new NotFoundException(
        `No se encontró el producto, el id ${idProducto} no existe`,
      );
    }

    return getProductoById;
  }

  async update(idProducto: number, updateProductoDto: UpdateProductoDto) {
    const producto = await this.productoRepository.findOne({
      where: { idProducto },
    });

    if (!producto) {
      throw new NotFoundException(
        `No se encontró el producto, el id ${idProducto} no existe`,
      );
    }

    // Actualizar campos simples
    if (updateProductoDto.nombre) producto.nombre = updateProductoDto.nombre;
    if (updateProductoDto.descripcion !== undefined) producto.descripcion = updateProductoDto.descripcion;
    if (updateProductoDto.estado !== undefined) producto.estado = updateProductoDto.estado;
    if (updateProductoDto.imagen) producto.imagen = updateProductoDto.imagen;

    // Actualizar relaciones
    if (updateProductoDto.fkUnidadMedida) {
      const unidadMedida = await this.unidadesMedidaRepository.findOne({
        where: { idUnidad: updateProductoDto.fkUnidadMedida },
      });
      if (!unidadMedida) {
        throw new BadRequestException('La unidad de medida no existe');
      }
      producto.fkUnidadMedida = unidadMedida;
    }

    if (updateProductoDto.fkCaracteristica !== undefined) {
      if (updateProductoDto.fkCaracteristica) {
        const caracteristica = await this.caracteristicasRepository.findOne({
          where: { idCaracteristica: updateProductoDto.fkCaracteristica },
        });
        if (!caracteristica) {
          throw new BadRequestException('La característica no existe');
        }
        producto.fkCaracteristica = caracteristica;
      } else {
        (producto as any).fkCaracteristica = null;
      }
    }

    await this.productoRepository.save(producto);

    return { status: 200, message: 'Datos actualizados con éxito' };
  }

  async changeStatus(idProducto: number) {
    const getProductoById = await this.productoRepository.findOneBy({
      idProducto,
    });

    if (!getProductoById) {
      throw new NotFoundException(
        `No se encontró el producto, el id ${idProducto} no existe`,
      );
    }

    getProductoById.estado = !getProductoById.estado;

    return await this.productoRepository.save(getProductoById);
  }

  async remove(idProducto: number) {
    const producto = await this.productoRepository.findOne({
      where: { idProducto },
    });

    if (!producto) {
      throw new NotFoundException(
        `No se encontró el producto, el id ${idProducto} no existe`,
      );
    }

    return await this.productoRepository.remove(producto);
  }

  // Obtener productos con sus lotes y stock disponible
  async getProductosConStock() {
    const productos = await this.productoRepository.find({
      relations: ['lotes', 'lotes.unidades', 'fkUnidadMedida', 'fkCaracteristica'],
    });

    return productos.map(producto => {
      const lotesActivos = producto.lotes?.filter(l => l.estado) || [];
      const totalUnidades = lotesActivos.reduce((sum, lote) => {
        const disponibles = lote.unidades?.filter(u => u.estado === 'DISPONIBLE').length || 0;
        return sum + disponibles;
      }, 0);

      return {
        ...producto,
        stockDisponible: totalUnidades,
        totalLotes: lotesActivos.length,
      };
    });
  }
}
