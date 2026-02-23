import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from './roles/roles.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ModulosModule } from './modulos/modulos.module';
import { RutasModule } from './rutas/rutas.module';
import { PermisosModule } from './permisos/permisos.module';

import { InventariosModule } from './inventarios/inventarios.module';
import { UnidadesMedidaModule } from './unidades-medida/unidades-medida.module';
import { CaracteristicasModule } from './caracteristicas/caracteristicas.module';

// Nuevos módulos para el sistema de inventario
import { LotesModule } from './lotes/lotes.module';
import { UnidadesModule } from './unidades/unidades.module';
import { MateriasPrimasModule } from './materias-primas/materias-primas.module';
import { MovimientosModule } from './movimientos/movimientos.module';
import { LoteMateriaPrimaModule } from './lote-materia-prima/lote-materia-prima.module';

import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { RolPermisoModule } from './rol-permiso/rol-permiso.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { AuthModule } from './auth/auth.module';
import { WebsocketModule } from './websocket/websocket.module';
import { SeedsService } from './database/seeds/seeds.service';
import { SeedsModule } from './database/seeds/seeds.module';
import { CommandModule } from 'nestjs-command';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      entities: [__dirname + '/**/*.entity.{ts,js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      autoLoadEntities: true,
      migrationsRun: true,
    }),
    RolesModule,
    UsuariosModule,
    ModulosModule,
    RutasModule,
    PermisosModule,

    InventariosModule,
    UnidadesMedidaModule,
    CaracteristicasModule,

    // Nuevos módulos
    LotesModule,
    UnidadesModule,
    MateriasPrimasModule,
    MovimientosModule,
    LoteMateriaPrimaModule,

    RolPermisoModule,
    NotificacionesModule,
    AuthModule,
    WebsocketModule,
    CommandModule,
    SeedsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    AppService,
    SeedsService,
  ],
})
export class AppModule { }
