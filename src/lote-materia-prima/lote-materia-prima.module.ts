import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoteMateriaPrimaService } from './lote-materia-prima.service';
import { LoteMateriaPrimaController } from './lote-materia-prima.controller';
import { LoteMateriaPrima } from './entities/lote-materia-prima.entity';
import { Lotes } from '../lotes/entities/lote.entity';
import { MateriasPrimas } from '../materias-primas/entities/materia-prima.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LoteMateriaPrima, Lotes, MateriasPrimas])],
  controllers: [LoteMateriaPrimaController],
  providers: [LoteMateriaPrimaService],
  exports: [LoteMateriaPrimaService],
})
export class LoteMateriaPrimaModule {}