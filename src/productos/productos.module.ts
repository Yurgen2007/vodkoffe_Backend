import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Productos } from './entities/producto.entity';
import { UnidadesMedida } from '../unidades-medida/entities/unidades-medida.entity';
import { Caracteristicas } from '../caracteristicas/entities/caracteristica.entity';

@Module({
  controllers: [ProductosController],
  providers: [ProductosService],
  imports: [TypeOrmModule.forFeature([Productos, UnidadesMedida, Caracteristicas])],
  exports: [TypeOrmModule, ProductosService]
})
export class ProductosModule { }
