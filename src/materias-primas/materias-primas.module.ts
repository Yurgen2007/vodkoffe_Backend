import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MateriasPrimasService } from './materias-primas.service';
import { MateriasPrimasController } from './materias-primas.controller';
import { MateriasPrimas } from './entities/materia-prima.entity';
import { LoteMateriaPrima } from '../lote-materia-prima/entities/lote-materia-prima.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MateriasPrimas, LoteMateriaPrima])],
  controllers: [MateriasPrimasController],
  providers: [MateriasPrimasService],
  exports: [MateriasPrimasService, TypeOrmModule],
})
export class MateriasPrimasModule {}
