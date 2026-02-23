import { Module } from '@nestjs/common';
import { InventariosService } from './inventarios.service';
import { InventariosController } from './inventarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventarios } from './entities/inventario.entity';
import { Unidades } from '../unidades/entities/unidad.entity';

@Module({
  controllers: [InventariosController],
  providers: [InventariosService],
  imports: [TypeOrmModule.forFeature([Inventarios, Unidades])],
  exports: [TypeOrmModule]
})
export class InventariosModule { }
