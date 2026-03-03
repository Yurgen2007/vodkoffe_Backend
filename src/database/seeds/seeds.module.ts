import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modulos } from 'src/modulos/entities/modulo.entity';
import { SeedsService } from './seeds.service';
import { SeedsCommand } from './seeds.command';
import { Roles } from 'src/roles/entities/role.entity';
import { Usuarios } from 'src/usuarios/entities/usuario.entity'
import { Permisos } from 'src/permisos/entities/permiso.entity'
import { Rutas } from 'src/rutas/entities/ruta.entity'
import { Notificaciones } from 'src/notificaciones/entities/notificacione.entity';
import { RolPermiso } from 'src/rol-permiso/entities/rol-permiso.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Modulos, Roles, Usuarios, Permisos, Rutas, Notificaciones, RolPermiso])],
    providers: [SeedsService, SeedsCommand],
    exports: [SeedsService]
})
export class SeedsModule {}
