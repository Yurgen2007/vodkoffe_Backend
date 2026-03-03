import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCantidadesToMovimientos1744000000000
  implements MigrationInterface
{
  name = 'AddCantidadesToMovimientos1744000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columnas de cantidades a la tabla movimientos
    await queryRunner.query(`
      ALTER TABLE "movimientos" 
      ADD COLUMN IF NOT EXISTS "cantidad_vendida" INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "cantidad_degustacion" INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "cantidad_alianza" INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "cantidad_total" INTEGER NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "movimientos" 
      DROP COLUMN IF EXISTS "cantidad_vendida",
      DROP COLUMN IF EXISTS "cantidad_degustacion",
      DROP COLUMN IF EXISTS "cantidad_alianza",
      DROP COLUMN IF EXISTS "cantidad_total"
    `);
  }
}
