import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadesService } from './unidades.service';
import { UnidadesController } from './unidades.controller';
import { Unidades } from './entities/unidad.entity';
import { Lotes } from '../lotes/entities/lote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Unidades, Lotes])],
  controllers: [UnidadesController],
  providers: [UnidadesService],
  exports: [UnidadesService],
})
export class UnidadesModule {}