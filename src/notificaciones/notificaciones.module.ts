import { Module } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificaciones } from './entities/notificacione.entity';
import { WebsocketModule } from 'src/websocket/websocket.module';
import { Productos } from 'src/productos/entities/producto.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CronMonitorService } from './cron-monitor.service';

@Module({
  controllers: [NotificacionesController],
  providers: [NotificacionesService, CronMonitorService],
  imports: [TypeOrmModule.forFeature([Notificaciones, Productos]), WebsocketModule, AuthModule],
  exports: [TypeOrmModule, NotificacionesService]
})
export class NotificacionesModule { }
