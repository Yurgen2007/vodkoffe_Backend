import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRelationsToUnidades1741000000001 implements MigrationInterface {
    name = 'AddRelationsToUnidades1741000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar columna fk_inventario a la tabla unidades
        await queryRunner.query(`
            ALTER TABLE "public"."unidades" 
            ADD COLUMN "fk_inventario" integer
        `);

        // Agregar columna fk_caracteristica a la tabla unidades
        await queryRunner.query(`
            ALTER TABLE "public"."unidades" 
            ADD COLUMN "fk_caracteristica" integer
        `);

        // Agregar columna fk_unidad_medida a la tabla unidades
        await queryRunner.query(`
            ALTER TABLE "public"."unidades" 
            ADD COLUMN "fk_unidad_medida" integer
        `);

        // Agregar foreign key para fk_inventario
        await queryRunner.query(`
            ALTER TABLE "public"."unidades" 
            ADD CONSTRAINT "fk_unidades_inventario" 
            FOREIGN KEY ("fk_inventario") 
            REFERENCES "inventarios"("id_inventario") 
            ON DELETE CASCADE ON UPDATE CASCADE
        `);

        // Agregar foreign key para fk_caracteristica
        await queryRunner.query(`
            ALTER TABLE "public"."unidades" 
            ADD CONSTRAINT "fk_unidades_caracteristica" 
            FOREIGN KEY ("fk_caracteristica") 
            REFERENCES "caracteristicas"("id_caracteristica") 
            ON DELETE CASCADE ON UPDATE CASCADE
        `);

        // Agregar foreign key para fk_unidad_medida
        await queryRunner.query(`
            ALTER TABLE "public"."unidades" 
            ADD CONSTRAINT "fk_unidades_unidad_medida" 
            FOREIGN KEY ("fk_unidad_medida") 
            REFERENCES "unidades_medida"("id_unidad") 
            ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar foreign keys
        await queryRunner.query(`
            ALTER TABLE "public"."unidades" 
            DROP CONSTRAINT IF EXISTS "fk_unidades_inventario"
        `);

        await queryRunner.query(`
            ALTER TABLE "public"."unidades" 
            DROP CONSTRAINT IF EXISTS "fk_unidades_caracteristica"
        `);

        await queryRunner.query(`
            ALTER TABLE "public"."unidades" 
            DROP CONSTRAINT IF EXISTS "fk_unidades_unidad_medida"
        `);

        // Eliminar columnas
        await queryRunner.query(`
            ALTER TABLE "public"."unidades" 
            DROP COLUMN IF EXISTS "fk_inventario"
        `);

        await queryRunner.query(`
            ALTER TABLE "public"."unidades" 
            DROP COLUMN IF EXISTS "fk_caracteristica"
        `);

        await queryRunner.query(`
            ALTER TABLE "public"."unidades" 
            DROP COLUMN IF EXISTS "fk_unidad_medida"
        `);
    }
}
