import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LotesService } from './lotes.service';
import { LotesController } from './lotes.controller';
import { Lotes } from './entities/lote.entity';
import { Unidades } from '../unidades/entities/unidad.entity';
import { LoteMateriaPrima } from '../lote-materia-prima/entities/lote-materia-prima.entity';
import { MateriasPrimas } from '../materias-primas/entities/materia-prima.entity';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lotes, Unidades, LoteMateriaPrima, MateriasPrimas]),
    NotificacionesModule,
  ],
  controllers: [LotesController],
  providers: [LotesService],
  exports: [LotesService],
})
export class LotesModule {}
