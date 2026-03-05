import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1772652119467 implements MigrationInterface {
    name = 'InitSchema1772652119467'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "modulos" ("id_modulo" SERIAL NOT NULL, "nombre" character varying(70), "descripcion" character varying(205), "href" character varying(205), "icono" character varying(205) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "estado" boolean, CONSTRAINT "PK_68ad50fa332064a72e31fcdf87a" PRIMARY KEY ("id_modulo"))`);
        await queryRunner.query(`CREATE TABLE "rutas" ("id_ruta" SERIAL NOT NULL, "nombre" character varying(205), "descripcion" character varying(205), "href" character varying(205) NOT NULL, "icono" character varying(205), "listed" boolean NOT NULL, "estado" boolean, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "fk_modulo" integer, CONSTRAINT "PK_5969d8e88a11612682925e9275a" PRIMARY KEY ("id_ruta"))`);
        await queryRunner.query(`CREATE TABLE "permisos" ("id_permiso" SERIAL NOT NULL, "permiso" character varying(100), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "fk_ruta" integer, CONSTRAINT "PK_76e2dbb965cd631705b6caaf698" PRIMARY KEY ("id_permiso"))`);
        await queryRunner.query(`CREATE TABLE "rol_permiso" ("id_rol_permiso" SERIAL NOT NULL, "estado" boolean, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "fk_permiso" integer, "fk_rol" integer, CONSTRAINT "PK_151312cfdb886f6d9dc19f9ccfd" PRIMARY KEY ("id_rol_permiso"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id_rol" SERIAL NOT NULL, "nombre" character varying(70), "estado" boolean, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_25f8d4161f00a1dd1cbe5068695" PRIMARY KEY ("id_rol"))`);
        await queryRunner.query(`CREATE TABLE "notificaciones" ("id_notificacion" SERIAL NOT NULL, "titulo" character varying(205) NOT NULL, "mensaje" character varying(500), "leido" boolean NOT NULL DEFAULT false, "requiere_accion" boolean NOT NULL DEFAULT false, "estado" character varying(50), "data" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "fk_usuario" integer, CONSTRAINT "PK_ff498b8eb6b226a9fc52889ddac" PRIMARY KEY ("id_notificacion"))`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id_usuario" SERIAL NOT NULL, "documento" integer, "nombre" character varying(70), "apellido" character varying(70), "edad" integer, "telefono" character varying(15), "correo" character varying(70), "estado" boolean, "cargo" character varying(70), "password" character varying(60), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "perfil" character varying(255), "service_mail" character varying(50), "mail_user" character varying(100), "mail_password" character varying(255), "fk_rol" integer, CONSTRAINT "UQ_604e2077971f192d85cffb5c437" UNIQUE ("documento"), CONSTRAINT "PK_dfe59db369749f9042499fd8107" PRIMARY KEY ("id_usuario"))`);
        await queryRunner.query(`CREATE TABLE "inventarios" ("id_inventario" SERIAL NOT NULL, "nombre" character varying(100), "estado" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2c4442a91d7530d5b410d640d8c" PRIMARY KEY ("id_inventario"))`);
        await queryRunner.query(`CREATE TABLE "caracteristicas" ("id_caracteristica" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, "descripcion" character varying(255), "estado" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_52e73803f4f7ca4fa6ef0954cba" PRIMARY KEY ("id_caracteristica"))`);
        await queryRunner.query(`CREATE TABLE "unidades" ("id_unidad" SERIAL NOT NULL, "codigo_unidad" character varying(100) NOT NULL, "estado" character varying(20) NOT NULL DEFAULT 'DISPONIBLE', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "fk_lote" integer, "fk_inventario" integer, "fk_caracteristica" integer, "fk_unidad_medida" integer, CONSTRAINT "UQ_38ea0d60ca226f41823d31c08f0" UNIQUE ("codigo_unidad"), CONSTRAINT "PK_ded7b30f00651013ea0b8b6fe8a" PRIMARY KEY ("id_unidad"))`);
        await queryRunner.query(`CREATE TABLE "movimientos" ("id_movimiento" SERIAL NOT NULL, "tipo" character varying(20) NOT NULL, "cantidad_vendida" integer NOT NULL DEFAULT '0', "cantidad_degustacion" integer NOT NULL DEFAULT '0', "cantidad_alianza" integer NOT NULL DEFAULT '0', "cantidad_total" integer NOT NULL, "precio_unitario" numeric(12,2) NOT NULL, "precio_total" numeric(12,2) NOT NULL, "descripcion" character varying(255), "nombre_cliente" character varying(255), "fecha_movimiento" date NOT NULL, "tipo_inventario" character varying(20), "cantidad_inventario" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "fk_lote" integer, "fk_usuario" integer, "fk_unidad" integer, CONSTRAINT "PK_3883c5e72c07666baf33f846f8c" PRIMARY KEY ("id_movimiento"))`);
        await queryRunner.query(`CREATE TABLE "lotes" ("id_lote" SERIAL NOT NULL, "codigo_lote" character varying(50) NOT NULL, "cantidad_unidades" integer NOT NULL DEFAULT '0', "fecha_produccion" date NOT NULL, "fecha_vencimiento" date, "costo_unitario" numeric(12,2) NOT NULL, "costo_total" numeric(12,2) NOT NULL, "costo_materias_primas" numeric(12,2) NOT NULL DEFAULT '0', "estado" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3b60a4e4c7e4ac0510a01232ae2" UNIQUE ("codigo_lote"), CONSTRAINT "PK_268921534e5419c12c6bdd92ca0" PRIMARY KEY ("id_lote"))`);
        await queryRunner.query(`CREATE TABLE "lote_materia_prima" ("id_lote_materia_prima" SERIAL NOT NULL, "cantidad" numeric(12,2) NOT NULL, "costo_unitario" numeric(12,2) NOT NULL, "costo_total" numeric(12,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "fk_lote" integer, "fk_materia_prima" integer, CONSTRAINT "PK_aa5f8eb82142f14f05bd22a9e81" PRIMARY KEY ("id_lote_materia_prima"))`);
        await queryRunner.query(`CREATE TABLE "materias_primas" ("id_materia_prima" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, "descripcion" character varying(255), "costoUnitario" numeric(12,2) NOT NULL DEFAULT '0', "estado" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "fk_unidad_medida" integer, CONSTRAINT "PK_3683a58299781211049fddecd62" PRIMARY KEY ("id_materia_prima"))`);
        await queryRunner.query(`CREATE TABLE "unidades_medida" ("id_unidad" SERIAL NOT NULL, "nombre" character varying(70) NOT NULL, "estado" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ca39afd476a07a87d3c3faf916c" PRIMARY KEY ("id_unidad"))`);
        await queryRunner.query(`ALTER TABLE "rutas" ADD CONSTRAINT "FK_a97abdad35a72da8da3be972021" FOREIGN KEY ("fk_modulo") REFERENCES "modulos"("id_modulo") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "permisos" ADD CONSTRAINT "FK_201e212c6b7ce88de3b1d9d0799" FOREIGN KEY ("fk_ruta") REFERENCES "rutas"("id_ruta") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rol_permiso" ADD CONSTRAINT "FK_a06c4f160e4c589da93f7c191bf" FOREIGN KEY ("fk_permiso") REFERENCES "permisos"("id_permiso") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rol_permiso" ADD CONSTRAINT "FK_ba15da702a0f5d500588c597a9d" FOREIGN KEY ("fk_rol") REFERENCES "roles"("id_rol") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notificaciones" ADD CONSTRAINT "FK_77a0ebfb81a5cb8e3852c75e0a8" FOREIGN KEY ("fk_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_2debd80fc8ffea2584356b81313" FOREIGN KEY ("fk_rol") REFERENCES "roles"("id_rol") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "unidades" ADD CONSTRAINT "FK_023cb6c92ae717e64e1ba95530d" FOREIGN KEY ("fk_lote") REFERENCES "lotes"("id_lote") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "unidades" ADD CONSTRAINT "FK_e78facb89f7e11b9f8b7aab9b6a" FOREIGN KEY ("fk_inventario") REFERENCES "inventarios"("id_inventario") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "unidades" ADD CONSTRAINT "FK_83b0b6d0c00ecd2fa2688cb76a4" FOREIGN KEY ("fk_caracteristica") REFERENCES "caracteristicas"("id_caracteristica") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "unidades" ADD CONSTRAINT "FK_3e24462de4d836ca4a5709f77c2" FOREIGN KEY ("fk_unidad_medida") REFERENCES "unidades_medida"("id_unidad") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movimientos" ADD CONSTRAINT "FK_44b16ab37d950b97e430eedb06c" FOREIGN KEY ("fk_lote") REFERENCES "lotes"("id_lote") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movimientos" ADD CONSTRAINT "FK_9e4cbcfb59dc5e94a41bd5236eb" FOREIGN KEY ("fk_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movimientos" ADD CONSTRAINT "FK_5f51c9b480d95e189cb0a7dbd43" FOREIGN KEY ("fk_unidad") REFERENCES "unidades"("id_unidad") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lote_materia_prima" ADD CONSTRAINT "FK_0bb489ea9bc3d44fab2801d8429" FOREIGN KEY ("fk_lote") REFERENCES "lotes"("id_lote") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lote_materia_prima" ADD CONSTRAINT "FK_8f511abaaa9d2ed4cc239318b43" FOREIGN KEY ("fk_materia_prima") REFERENCES "materias_primas"("id_materia_prima") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "materias_primas" ADD CONSTRAINT "FK_117a2b43555d42d089c02b61832" FOREIGN KEY ("fk_unidad_medida") REFERENCES "unidades_medida"("id_unidad") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "materias_primas" DROP CONSTRAINT "FK_117a2b43555d42d089c02b61832"`);
        await queryRunner.query(`ALTER TABLE "lote_materia_prima" DROP CONSTRAINT "FK_8f511abaaa9d2ed4cc239318b43"`);
        await queryRunner.query(`ALTER TABLE "lote_materia_prima" DROP CONSTRAINT "FK_0bb489ea9bc3d44fab2801d8429"`);
        await queryRunner.query(`ALTER TABLE "movimientos" DROP CONSTRAINT "FK_5f51c9b480d95e189cb0a7dbd43"`);
        await queryRunner.query(`ALTER TABLE "movimientos" DROP CONSTRAINT "FK_9e4cbcfb59dc5e94a41bd5236eb"`);
        await queryRunner.query(`ALTER TABLE "movimientos" DROP CONSTRAINT "FK_44b16ab37d950b97e430eedb06c"`);
        await queryRunner.query(`ALTER TABLE "unidades" DROP CONSTRAINT "FK_3e24462de4d836ca4a5709f77c2"`);
        await queryRunner.query(`ALTER TABLE "unidades" DROP CONSTRAINT "FK_83b0b6d0c00ecd2fa2688cb76a4"`);
        await queryRunner.query(`ALTER TABLE "unidades" DROP CONSTRAINT "FK_e78facb89f7e11b9f8b7aab9b6a"`);
        await queryRunner.query(`ALTER TABLE "unidades" DROP CONSTRAINT "FK_023cb6c92ae717e64e1ba95530d"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_2debd80fc8ffea2584356b81313"`);
        await queryRunner.query(`ALTER TABLE "notificaciones" DROP CONSTRAINT "FK_77a0ebfb81a5cb8e3852c75e0a8"`);
        await queryRunner.query(`ALTER TABLE "rol_permiso" DROP CONSTRAINT "FK_ba15da702a0f5d500588c597a9d"`);
        await queryRunner.query(`ALTER TABLE "rol_permiso" DROP CONSTRAINT "FK_a06c4f160e4c589da93f7c191bf"`);
        await queryRunner.query(`ALTER TABLE "permisos" DROP CONSTRAINT "FK_201e212c6b7ce88de3b1d9d0799"`);
        await queryRunner.query(`ALTER TABLE "rutas" DROP CONSTRAINT "FK_a97abdad35a72da8da3be972021"`);
        await queryRunner.query(`DROP TABLE "unidades_medida"`);
        await queryRunner.query(`DROP TABLE "materias_primas"`);
        await queryRunner.query(`DROP TABLE "lote_materia_prima"`);
        await queryRunner.query(`DROP TABLE "lotes"`);
        await queryRunner.query(`DROP TABLE "movimientos"`);
        await queryRunner.query(`DROP TABLE "unidades"`);
        await queryRunner.query(`DROP TABLE "caracteristicas"`);
        await queryRunner.query(`DROP TABLE "inventarios"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TABLE "notificaciones"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "rol_permiso"`);
        await queryRunner.query(`DROP TABLE "permisos"`);
        await queryRunner.query(`DROP TABLE "rutas"`);
        await queryRunner.query(`DROP TABLE "modulos"`);
    }

}
