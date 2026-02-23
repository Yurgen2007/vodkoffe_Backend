import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropProductosTable1742000000000 implements MigrationInterface {
  name = 'DropProductosTable1742000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Primero eliminar la restricción de clave foránea de lotes si existe
    await queryRunner.query(`
      ALTER TABLE IF EXISTS "lotes" DROP CONSTRAINT IF EXISTS "fk_lotes_producto"
    `);

    // Eliminar la columna fk_producto de lotes
    await queryRunner.query(`
      ALTER TABLE IF EXISTS "lotes" DROP COLUMN IF EXISTS "fk_producto"
    `);

    // Eliminar la tabla productos
    await queryRunner.query(`
      DROP TABLE IF EXISTS "productos" CASCADE
    `);

    // Eliminar la tabla elementos si existe
    await queryRunner.query(`
      DROP TABLE IF EXISTS "elementos" CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recrear la tabla productos (sin datos)
    await queryRunner.query(`
      CREATE TABLE "productos" (
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

    // Recrear la columna en lotes
    await queryRunner.query(`
      ALTER TABLE "lotes" ADD COLUMN "fk_producto" INTEGER REFERENCES "productos"("id_producto")
    `);
  }
}
