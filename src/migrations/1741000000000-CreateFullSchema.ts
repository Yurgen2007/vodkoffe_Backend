import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFullSchema1741000000000 implements MigrationInterface {
  name = 'CreateFullSchema1741000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Tabla roles
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id_rol" SERIAL PRIMARY KEY,
        "nombre" VARCHAR(70),
        "estado" BOOLEAN,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now()
      )
    `);

    // 2. Tabla modulos
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "modulos" (
        "id_modulo" SERIAL PRIMARY KEY,
        "nombre" VARCHAR(70),
        "descripcion" VARCHAR(205),
        "href" VARCHAR(205),
        "icono" VARCHAR(205),
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "estado" BOOLEAN
      )
    `);

    // 3. Tabla rutas
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rutas" (
        "id_ruta" SERIAL PRIMARY KEY,
        "nombre" VARCHAR(205),
        "descripcion" VARCHAR(205),
        "href" VARCHAR(205) NOT NULL,
        "icono" VARCHAR(205),
        "listed" BOOLEAN NOT NULL DEFAULT false,
        "estado" BOOLEAN,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "fk_modulo" INTEGER REFERENCES "modulos"("id_modulo")
      )
    `);

    // 4. Tabla permisos
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "permisos" (
        "id_permiso" SERIAL PRIMARY KEY,
        "permiso" VARCHAR(100),
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "fk_ruta" INTEGER REFERENCES "rutas"("id_ruta") ON DELETE CASCADE
      )
    `);

    // 5. Tabla rol_permiso
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rol_permiso" (
        "id_rol_permiso" SERIAL PRIMARY KEY,
        "estado" BOOLEAN,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "fk_permiso" INTEGER REFERENCES "permisos"("id_permiso") ON DELETE CASCADE,
        "fk_rol" INTEGER REFERENCES "roles"("id_rol") ON DELETE CASCADE
      )
    `);

    // 6. Tabla usuarios
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "usuarios" (
        "id_usuario" SERIAL PRIMARY KEY,
        "documento" INTEGER UNIQUE,
        "nombre" VARCHAR(70),
        "apellido" VARCHAR(70),
        "edad" INTEGER,
        "telefono" VARCHAR(15),
        "correo" VARCHAR(70),
        "estado" BOOLEAN,
        "cargo" VARCHAR(70),
        "password" VARCHAR(60),
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "perfil" VARCHAR(255),
        "service_mail" VARCHAR(50),
        "mail_user" VARCHAR(100),
        "mail_password" VARCHAR(255),
        "fk_rol" INTEGER REFERENCES "roles"("id_rol")
      )
    `);

    // 7. Tabla productos
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "productos" (
        "id_producto" SERIAL PRIMARY KEY,
        "codigo" VARCHAR(50) UNIQUE,
        "nombre" VARCHAR(100) NOT NULL,
        "descripcion" VARCHAR(255),
        "imagen" VARCHAR(255),
        "estado" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "fk_unidad_medida" INTEGER REFERENCES "unidades_medida"("id_unidad"),
        "fk_caracteristica" INTEGER REFERENCES "caracteristicas"("id_caracteristica")
      )
    `);

    // 8. Tabla caracteristicas
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "caracteristicas" (
        "id_caracteristica" SERIAL PRIMARY KEY,
        "nombre" VARCHAR(100) NOT NULL,
        "descripcion" VARCHAR(255),
        "estado" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now()
      )
    `);

    // 9. Tabla unidades_medida
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "unidades_medida" (
        "id_unidad" SERIAL PRIMARY KEY,
        "nombre" VARCHAR(70) NOT NULL,
        "estado" BOOLEAN NOT NULL,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now()
      )
    `);

    // 10. Tabla lotes
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "lotes" (
        "id_lote" SERIAL PRIMARY KEY,
        "codigo_lote" VARCHAR(50) UNIQUE NOT NULL,
        "cantidad_unidades" INTEGER NOT NULL,
        "fecha_produccion" DATE NOT NULL,
        "fecha_vencimiento" DATE,
        "costo_unitario" DECIMAL(12,2) NOT NULL,
        "costo_total" DECIMAL(12,2) NOT NULL,
        "costo_materias_primas" DECIMAL(12,2) DEFAULT 0,
        "estado" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "fk_producto" INTEGER REFERENCES "productos"("id_producto")
      )
    `);

    // 11. Tabla unidades
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "unidades" (
        "id_unidad" SERIAL PRIMARY KEY,
        "codigo_unidad" VARCHAR(100) UNIQUE NOT NULL,
        "identificador_usuario" VARCHAR(100),
        "estado" VARCHAR(20) DEFAULT 'DISPONIBLE',
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "fk_lote" INTEGER REFERENCES "lotes"("id_lote")
      )
    `);
    
    // Crear índice para identificador_usuario
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_unidades_identificador_usuario" ON "unidades"("identificador_usuario")
    `);

    // 12. Tabla materias_primas
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "materias_primas" (
        "id_materia_prima" SERIAL PRIMARY KEY,
        "nombre" VARCHAR(100) NOT NULL,
        "descripcion" VARCHAR(255),
        "costo_unitario" DECIMAL(12,2) DEFAULT 0,
        "estado" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "fk_unidad_medida" INTEGER REFERENCES "unidades_medida"("id_unidad")
      )
    `);

    // 13. Tabla lote_materia_prima
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "lote_materia_prima" (
        "id_lote_materia_prima" SERIAL PRIMARY KEY,
        "cantidad" DECIMAL(12,2) NOT NULL,
        "costo_unitario" DECIMAL(12,2) NOT NULL,
        "costo_total" DECIMAL(12,2) NOT NULL,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "fk_lote" INTEGER REFERENCES "lotes"("id_lote"),
        "fk_materia_prima" INTEGER REFERENCES "materias_primas"("id_materia_prima")
      )
    `);

    // 14. Tabla movimientos
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "movimientos" (
        "id_movimiento" SERIAL PRIMARY KEY,
        "tipo" VARCHAR(20) NOT NULL,
        "tipo_no_venta" VARCHAR(20),
        "cantidad_vendida" INTEGER DEFAULT 0,
        "cantidad_degustacion" INTEGER DEFAULT 0,
        "cantidad_alianza" INTEGER DEFAULT 0,
        "cantidad_otro" INTEGER DEFAULT 0,
        "cantidad_total" INTEGER NOT NULL,
        "precio_unitario" DECIMAL(12,2) NOT NULL,
        "precio_total" DECIMAL(12,2) NOT NULL,
        "descripcion" VARCHAR(255),
        "fecha_movimiento" DATE NOT NULL,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now(),
        "fk_lote" INTEGER REFERENCES "lotes"("id_lote")
      )
    `);

    // 15. Tabla inventarios
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "inventarios" (
        "id_inventario" SERIAL PRIMARY KEY,
        "nombre" VARCHAR(100),
        "estado" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now()
      )
    `);

    // 16. Tabla notificaciones
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notificaciones" (
        "id_notificacion" SERIAL PRIMARY KEY,
        "titulo" VARCHAR(205) NOT NULL,
        "mensaje" VARCHAR(500),
        "leido" BOOLEAN DEFAULT false,
        "requiere_accion" BOOLEAN DEFAULT false,
        "estado" VARCHAR(50),
        "data" JSONB,
        "created_at" TIMESTAMP DEFAULT now(),
        "fk_usuario" INTEGER REFERENCES "usuarios"("id_usuario")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar tablas en orden inverso (respetando foreign keys)
    await queryRunner.query(`DROP TABLE IF EXISTS "notificaciones" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inventarios" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "movimientos" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "lote_materia_prima" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "materias_primas" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "unidades" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "lotes" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "unidades_medida" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "caracteristicas" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "productos" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "usuarios" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rol_permiso" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permisos" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rutas" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "modulos" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles" CASCADE`);
  }
}
