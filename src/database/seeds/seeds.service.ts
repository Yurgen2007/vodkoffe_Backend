import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../../data-source';
import { Roles } from '../../roles/entities/role.entity';
import { Modulos } from '../../modulos/entities/modulo.entity';
import { Rutas } from '../../rutas/entities/ruta.entity';
import { Permisos } from '../../permisos/entities/permiso.entity';
import { RolPermiso } from '../../rol-permiso/entities/rol-permiso.entity';
import { Usuarios } from '../../usuarios/entities/usuario.entity';
import { Notificaciones } from '../../notificaciones/entities/notificacione.entity';

@Injectable()
export class SeedsService {
  private dataSource = AppDataSource;

  constructor(
    @InjectRepository(Roles)
    private rolesRepository: Repository<Roles>,
    @InjectRepository(Modulos)
    private modulosRepository: Repository<Modulos>,
    @InjectRepository(Rutas)
    private rutasRepository: Repository<Rutas>,
    @InjectRepository(Permisos)
    private permisosRepository: Repository<Permisos>,
    @InjectRepository(RolPermiso)
    private rolPermisoRepository: Repository<RolPermiso>,
    @InjectRepository(Usuarios)
    private usuariosRepository: Repository<Usuarios>,
    @InjectRepository(Notificaciones)
    private notificacionesRepository: Repository<Notificaciones>,
  ) {}

  async seed() {
    // Initialize database connection if not initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log('cli seed:database');
    console.log('Poblar la base de datos con datos defecto');

    const roles = [
      { idRol: 1, nombre: 'Administrador', estado: true },
    ];

    const modulos = [
      {
        idModulo: 1,
        nombre: 'Admin',
        href: null,
        icono: 'UserIcon',
        estado: true,
      },
      {
        idModulo: 2,
        nombre: 'Bodega',
        href: null,
        icono: 'ArchiveBoxIcon',
        estado: true,
      },
    ];

    // Removed: Notificaciones (idRuta: 21) and Lote Materia Prima (idRuta: 20)
    const rutas = [
      {
        idRuta: 1,
        nombre: 'Usuarios',
        href: 'admin/usuarios',
        fkModulo: { idModulo: 1 },
        icono: 'UserIcon',
        listed: true,
        estado: true,
      },
      {
        idRuta: 6,
        nombre: 'unidades',
        href: 'bodega/unidades',
        icono: 'BeakerIcon',
        listed: true,
        estado: true,
        fkModulo: { idModulo: 2 },
      },
      {
        idRuta: 8,
        nombre: 'Inventarios',
        href: 'bodega/inventario',
        icono: 'ClipboardDocumentListIcon',
        listed: true,
        estado: true,
        fkModulo: { idModulo: 2 },
      },
      {
        idRuta: 10,
        nombre: 'Roles',
        href: 'admin/roles',
        listed: false,
        estado: true,
        fkModulo: { idModulo: 1 },
      },
      {
        idRuta: 16,
        nombre: 'Unidades medida',
        href: 'bodega/unidades',
        listed: false,
        estado: true,
        fkModulo: { idModulo: 2 },
      },
      {
        idRuta: 17,
        nombre: 'Lotes',
        href: 'bodega/lotes',
        icono: 'CubeIcon',
        listed: true,
        estado: true,
        fkModulo: { idModulo: 2 },
      },
      {
        idRuta: 18,
        nombre: 'Materias Primas',
        href: 'bodega/materias-primas',
        icono: 'ArchiveBoxIcon',
        listed: true,
        estado: true,
        fkModulo: { idModulo: 2 },
      },
      {
        idRuta: 19,
        nombre: 'Movimientos',
        href: 'bodega/movimientos',
        icono: 'ArrowPathIcon',
        listed: false,
        estado: true,
        fkModulo: { idModulo: 2 },
      },
      // Removed: Lote Materia Prima (idRuta: 20)
      // Removed: Notificaciones (idRuta: 21)
      {
        idRuta: 22,
        nombre: 'Ingresos/Egresos',
        href: 'admin/ingresos-egresos',
        icono: 'ArrowsRightLeftIcon',
        listed: true,
        estado: true,
        fkModulo: { idModulo: 1 },
      },
    ];

    // Removed permissions for idRuta: 20 (Lote Materia Prima) and idRuta: 21 (Notificaciones)
    const permisos = [
      { idPermiso: 1, permiso: 'Crear Usuario', fkRuta: { idRuta: 1 } },
      { idPermiso: 2, permiso: 'Registro Masivo', fkRuta: { idRuta: 1 } },
      { idPermiso: 3, permiso: 'Listar Usuarios', fkRuta: { idRuta: 1 } },
      { idPermiso: 4, permiso: 'Actualizar Usuario', fkRuta: { idRuta: 1 } },
      { idPermiso: 5, permiso: 'Eliminar Usuario', fkRuta: { idRuta: 1 } },
      { idPermiso: 18, permiso: 'Crear Producto', fkRuta: { idRuta: 6 } },
      { idPermiso: 19, permiso: 'Listar Producto', fkRuta: { idRuta: 6 } },
      { idPermiso: 20, permiso: 'Actualizar Producto', fkRuta: { idRuta: 6 } },
      { idPermiso: 21, permiso: 'Eliminar Producto', fkRuta: { idRuta: 6 } },
      { idPermiso: 27, permiso: 'Crear Inventario', fkRuta: { idRuta: 8 } },
      { idPermiso: 28, permiso: 'Limitar Inventario', fkRuta: { idRuta: 8 } },
      { idPermiso: 29, permiso: 'Listar Inventario', fkRuta: { idRuta: 8 } },
      { idPermiso: 30, permiso: 'Desactivar Inventario', fkRuta: { idRuta: 8 } },
      { idPermiso: 33, permiso: 'Crear Rol', fkRuta: { idRuta: 10 } },
      { idPermiso: 34, permiso: 'Listar Roles', fkRuta: { idRuta: 10 } },
      { idPermiso: 35, permiso: 'Actualizar Rol', fkRuta: { idRuta: 10 } },
      { idPermiso: 36, permiso: 'Eliminar Rol', fkRuta: { idRuta: 10 } },
      { idPermiso: 37, permiso: 'Actualizar Permiso', fkRuta: { idRuta: 10 } },
      { idPermiso: 38, permiso: 'Asignar Permiso', fkRuta: { idRuta: 10 } },
      { idPermiso: 59, permiso: 'Crear unidad medida', fkRuta: { idRuta: 16 } },
      { idPermiso: 60, permiso: 'Listar unidad medida', fkRuta: { idRuta: 16 } },
      { idPermiso: 61, permiso: 'Actualizar unidad medida', fkRuta: { idRuta: 16 } },
      { idPermiso: 62, permiso: 'Eliminar unidad medida', fkRuta: { idRuta: 16 } },
      { idPermiso: 71, permiso: 'Exportar PDF', fkRuta: { idRuta: 6 } },
      { idPermiso: 72, permiso: 'Vender', fkRuta: { idRuta: 6 } },
      { idPermiso: 73, permiso: 'Crear Caracteristica', fkRuta: { idRuta: 6 } },
      { idPermiso: 74, permiso: 'Listar Caracteristica', fkRuta: { idRuta: 6 } },
      { idPermiso: 75, permiso: 'Actualizar Caracteristica', fkRuta: { idRuta: 6 } },
      { idPermiso: 76, permiso: 'Eliminar Caracteristica', fkRuta: { idRuta: 6 } },
      { idPermiso: 77, permiso: 'Crear Lote', fkRuta: { idRuta: 17 } },
      { idPermiso: 78, permiso: 'Listar Lote', fkRuta: { idRuta: 17 } },
      { idPermiso: 79, permiso: 'Actualizar Lote', fkRuta: { idRuta: 17 } },
      { idPermiso: 80, permiso: 'Eliminar Lote', fkRuta: { idRuta: 17 } },
      { idPermiso: 81, permiso: 'Crear Materia Prima', fkRuta: { idRuta: 18 } },
      { idPermiso: 82, permiso: 'Listar Materia Prima', fkRuta: { idRuta: 18 } },
      { idPermiso: 83, permiso: 'Actualizar Materia Prima', fkRuta: { idRuta: 18 } },
      { idPermiso: 84, permiso: 'Eliminar Materia Prima', fkRuta: { idRuta: 18 } },
      { idPermiso: 85, permiso: 'Crear Movimiento', fkRuta: { idRuta: 19 } },
      { idPermiso: 86, permiso: 'Listar Movimiento', fkRuta: { idRuta: 19 } },
      { idPermiso: 87, permiso: 'Actualizar Movimiento', fkRuta: { idRuta: 19 } },
      { idPermiso: 88, permiso: 'Eliminar Movimiento', fkRuta: { idRuta: 19 } },
      // Removed: idPermiso 89-95 (Lote Materia Prima and Notificaciones)
      { idPermiso: 96, permiso: 'Crear Ingreso/Egreso', fkRuta: { idRuta: 22 } },
      { idPermiso: 97, permiso: 'Listar Ingreso/Egreso', fkRuta: { idRuta: 22 } },
      { idPermiso: 98, permiso: 'Actualizar Ingreso/Egreso', fkRuta: { idRuta: 22 } },
      { idPermiso: 99, permiso: 'Eliminar Ingreso/Egreso', fkRuta: { idRuta: 22 } },
    ];

    // Updated rol_permiso without the removed permissions
    const rol_permiso = [
      { idRolPermiso: 1, estado: true, fkPermiso: { idPermiso: 1 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 2, estado: true, fkPermiso: { idPermiso: 2 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 3, estado: true, fkPermiso: { idPermiso: 3 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 4, estado: true, fkPermiso: { idPermiso: 4 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 5, estado: true, fkPermiso: { idPermiso: 5 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 18, estado: true, fkPermiso: { idPermiso: 18 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 19, estado: true, fkPermiso: { idPermiso: 19 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 20, estado: true, fkPermiso: { idPermiso: 20 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 21, estado: true, fkPermiso: { idPermiso: 21 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 27, estado: true, fkPermiso: { idPermiso: 27 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 28, estado: true, fkPermiso: { idPermiso: 28 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 29, estado: true, fkPermiso: { idPermiso: 29 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 30, estado: true, fkPermiso: { idPermiso: 30 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 33, estado: true, fkPermiso: { idPermiso: 33 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 34, estado: true, fkPermiso: { idPermiso: 34 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 35, estado: true, fkPermiso: { idPermiso: 35 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 36, estado: true, fkPermiso: { idPermiso: 36 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 37, estado: true, fkPermiso: { idPermiso: 37 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 38, estado: true, fkPermiso: { idPermiso: 38 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 59, estado: true, fkPermiso: { idPermiso: 59 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 60, estado: true, fkPermiso: { idPermiso: 60 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 61, estado: true, fkPermiso: { idPermiso: 61 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 62, estado: true, fkPermiso: { idPermiso: 62 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 73, estado: true, fkPermiso: { idPermiso: 73 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 74, estado: true, fkPermiso: { idPermiso: 74 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 75, estado: true, fkPermiso: { idPermiso: 75 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 76, estado: true, fkPermiso: { idPermiso: 76 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 71, estado: true, fkPermiso: { idPermiso: 71 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 72, estado: true, fkPermiso: { idPermiso: 72 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 80, estado: true, fkPermiso: { idPermiso: 77 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 81, estado: true, fkPermiso: { idPermiso: 78 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 82, estado: true, fkPermiso: { idPermiso: 79 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 83, estado: true, fkPermiso: { idPermiso: 80 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 84, estado: true, fkPermiso: { idPermiso: 81 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 85, estado: true, fkPermiso: { idPermiso: 82 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 86, estado: true, fkPermiso: { idPermiso: 83 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 87, estado: true, fkPermiso: { idPermiso: 84 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 88, estado: true, fkPermiso: { idPermiso: 85 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 89, estado: true, fkPermiso: { idPermiso: 86 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 90, estado: true, fkPermiso: { idPermiso: 87 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 91, estado: true, fkPermiso: { idPermiso: 88 }, fkRol: { idRol: 1 } },
      // Removed: rol_permiso for idPermiso 89-95
      { idRolPermiso: 99, estado: true, fkPermiso: { idPermiso: 96 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 100, estado: true, fkPermiso: { idPermiso: 97 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 101, estado: true, fkPermiso: { idPermiso: 98 }, fkRol: { idRol: 1 } },
      { idRolPermiso: 102, estado: true, fkPermiso: { idPermiso: 99 }, fkRol: { idRol: 1 } },
    ];

    const users = [
      {
        idUsuario: 1,
        documento: 123456789,
        nombre: 'Carlos',
        apellido: 'Alberto',
        edad: 30,
        telefono: '3001234567',
        correo: 'dipssvodkoffe@gmail.com',
        estado: true,
        cargo: 'Administrador',
        password: 'Admin123',
        perfil: 'defaultPerfil.png',
        serviceMail: 'gmail',
        mailUser: 'dipssvodkoffe@gmail.com',
        mailPassword: 'tidj oczk yuaf aqdr',
        fkRol: { idRol: 1 },
      },
    ];

    // FIRST: Delete ALL records from ALL tables
    console.log('Eliminando rol_permiso...');
    await this.rolPermisoRepository.query(`DELETE FROM rol_permiso`);

    console.log('Eliminando permisos...');
    await this.permisosRepository.query(`DELETE FROM permisos`);

    console.log('Eliminando notificaciones...');
    await this.notificacionesRepository.query(`DELETE FROM notificaciones`);

    console.log('Eliminando movimientos...');
    await this.dataSource.query(`DELETE FROM movimientos`);

    console.log('Eliminando lote_materia_prima...');
    await this.dataSource.query(`DELETE FROM lote_materia_prima`);

    console.log('Eliminando unidades...');
    await this.dataSource.query(`DELETE FROM unidades`);

    console.log('Eliminando lotes...');
    await this.dataSource.query(`DELETE FROM lotes`);

    console.log('Eliminando materias_primas...');
    await this.dataSource.query(`DELETE FROM materias_primas`);

    console.log('Eliminando caracteristicas...');
    await this.dataSource.query(`DELETE FROM caracteristicas`);

    console.log('Eliminando inventarios...');
    await this.dataSource.query(`DELETE FROM inventarios`);

    console.log('Eliminando unidades_medida...');
    await this.dataSource.query(`DELETE FROM unidades_medida`);

    console.log('Eliminando usuarios...');
    await this.usuariosRepository.query(`DELETE FROM usuarios`);

    console.log('Eliminando rutas...');
    await this.rutasRepository.query(`DELETE FROM rutas`);

    console.log('Eliminando modulos...');
    await this.modulosRepository.query(`DELETE FROM modulos`);

    console.log('Eliminando roles...');
    await this.rolesRepository.query(`DELETE FROM roles`);

    // SECOND: Insert only user, permissions, routes, modules, and roles
    console.log('Insertando roles...');
    for (const role of roles) {
      await this.rolesRepository.query(
        `INSERT INTO roles(id_rol, nombre, estado) VALUES ($1,$2,$3)`,
        [role.idRol, role.nombre, role.estado],
      );
    }

    console.log('Insertando modulos...');
    for (const modulo of modulos) {
      await this.modulosRepository.query(
        `INSERT INTO modulos(id_modulo, nombre, href, icono, estado) VALUES ($1,$2,$3,$4,$5)`,
        [modulo.idModulo, modulo.nombre, modulo.href, modulo.icono, modulo.estado],
      );
    }

    console.log('Insertando usuarios...');
    for (const user of users) {
      const saltOrRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltOrRounds);
      await this.usuariosRepository.query(
        `INSERT INTO usuarios(id_usuario, documento, nombre, apellido, edad, telefono, correo, estado, password, cargo, perfil, service_mail, mail_user, mail_password, fk_rol) 
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          user.idUsuario,
          user.documento,
          user.nombre,
          user.apellido,
          user.edad,
          user.telefono,
          user.correo,
          user.estado,
          hashedPassword,
          user.cargo,
          user.perfil || 'defaultPerfil.png',
          user.serviceMail || null,
          user.mailUser || null,
          user.mailPassword || null,
          user.fkRol.idRol,
        ],
      );
    }

    console.log('Insertando rutas...');
    for (const ruta of rutas) {
      await this.rutasRepository.query(
        `INSERT INTO rutas(id_ruta, nombre, href, fk_modulo, icono, listed, estado) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          ruta.idRuta,
          ruta.nombre,
          ruta.href,
          ruta.fkModulo.idModulo,
          ruta.icono,
          ruta.listed,
          ruta.estado,
        ],
      );
    }

    console.log('Insertando permisos...');
    for (const permiso of permisos) {
      await this.permisosRepository.query(
        `INSERT INTO permisos(id_permiso, permiso, fk_ruta) VALUES ($1,$2,$3)`,
        [permiso.idPermiso, permiso.permiso, permiso.fkRuta.idRuta],
      );
    }

    console.log('Insertando rol_permiso...');
    for (const rolPermiso of rol_permiso) {
      await this.rolPermisoRepository.query(
        `INSERT INTO rol_permiso(id_rol_permiso, estado, fk_permiso, fk_rol) VALUES ($1,$2,$3,$4)`,
        [
          rolPermiso.idRolPermiso,
          rolPermiso.estado,
          rolPermiso.fkPermiso.idPermiso,
          rolPermiso.fkRol.idRol,
        ],
      );
    }

    console.log('Seeding completado!');
  }
}
