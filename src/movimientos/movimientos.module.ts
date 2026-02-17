import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientosService } from './movimientos.service';
import { MovimientosController } from './movimientos.controller';
import { Movimientos } from './entities/movimiento.entity';
import { Lotes } from '../lotes/entities/lote.entity';
import { Unidades } from '../unidades/entities/unidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movimientos, Lotes, Unidades])],
  controllers: [MovimientosController],
  providers: [MovimientosService],
  exports: [MovimientosService],
})
export class MovimientosModule {}
