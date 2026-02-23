import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadesService } from './unidades.service';
import { UnidadesController } from './unidades.controller';
import { Unidades } from './entities/unidad.entity';
import { Lotes } from '../lotes/entities/lote.entity';
import { Inventarios } from '../inventarios/entities/inventario.entity';
import { Caracteristicas } from '../caracteristicas/entities/caracteristica.entity';
import { UnidadesMedida } from '../unidades-medida/entities/unidades-medida.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Unidades, Lotes, Inventarios, Caracteristicas, UnidadesMedida])],
  controllers: [UnidadesController],
  providers: [UnidadesService],
  exports: [UnidadesService],
})
export class UnidadesModule {}