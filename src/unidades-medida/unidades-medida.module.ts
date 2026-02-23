import { Module } from '@nestjs/common';
import { UnidadesMedidaService } from './unidades-medida.service';
import { UnidadesMedidaController } from './unidades-medida.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadesMedida } from './entities/unidades-medida.entity';
import { Unidades } from '../unidades/entities/unidad.entity';

@Module({
  controllers: [UnidadesMedidaController],
  providers: [UnidadesMedidaService],
  imports: [TypeOrmModule.forFeature([UnidadesMedida, Unidades])],
  exports:[TypeOrmModule]
})
export class UnidadesMedidaModule {}
