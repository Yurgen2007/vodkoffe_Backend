import { Module } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificaciones } from './entities/notificacione.entity';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { AuthModule } from 'src/auth/auth.module';
import { CronMonitorService } from './cron-monitor.service';
import { Lotes } from 'src/lotes/entities/lote.entity';
import { Unidades } from 'src/unidades/entities/unidad.entity';

@Module({
  controllers: [NotificacionesController],
  providers: [NotificacionesService, CronMonitorService],
  imports: [TypeOrmModule.forFeature([Notificaciones, Lotes, Unidades]), WebsocketModule, AuthModule],
  exports: [TypeOrmModule, NotificacionesService]
})
export class NotificacionesModule { }
