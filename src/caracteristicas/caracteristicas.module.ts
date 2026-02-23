import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaracteristicasService } from './caracteristicas.service';
import { CaracteristicasController } from './caracteristicas.controller';
import { Caracteristicas } from './entities/caracteristica.entity';
import { Unidades } from '../unidades/entities/unidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Caracteristicas, Unidades])],
  controllers: [CaracteristicasController],
  providers: [CaracteristicasService],
  exports: [CaracteristicasService, TypeOrmModule],
})
export class CaracteristicasModule {}
