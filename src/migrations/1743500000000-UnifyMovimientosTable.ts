import { MigrationInterface, QueryRunner } from 'typeorm';

export class UnifyMovimientosTable1743500000000 implements MigrationInterface {
  name = 'UnifyMovimientosTable1743500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Agregar fk_usuario a movimientos
    await queryRunner.query(`
      ALTER TABLE "movimientos" 
      ADD COLUMN IF NOT EXISTS "fk_usuario" INTEGER REFERENCES "usuarios"("id_usuario")
    `);

    // 2. Agregar campos de inventario a movimientos
    await queryRunner.query(`
      ALTER TABLE "movimientos" 
      ADD COLUMN IF NOT EXISTS "tipo_inventario" VARCHAR(20),
      ADD COLUMN IF NOT EXISTS "cantidad_inventario" INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "fk_unidad" INTEGER REFERENCES "unidades"("id_unidad")
    `);

    // 3. Eliminar la tabla movimientos_inventario
    await queryRunner.query(`
      DROP TABLE IF EXISTS "movimientos_inventario" CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recrear la tabla movimientos_inventario
    await queryRunner.query(`
      CREATE TABLE "movimientos_inventario" (
        "id" SERIAL PRIMARY KEY,
        "id_unidad" INTEGER REFERENCES "unidades"("id_unidad"),
        "id_usuario" INTEGER REFERENCES "usuarios"("id_usuario"),
        "tipo_movimiento" VARCHAR(20),
        "cantidad" INTEGER,
        "fecha" TIMESTAMP DEFAULT now()
      )
    `);

    // Eliminar campos agregados
    await queryRunner.query(`
      ALTER TABLE "movimientos" 
      DROP COLUMN IF EXISTS "fk_usuario",
      DROP COLUMN IF EXISTS "tipo_inventario",
      DROP COLUMN IF EXISTS "cantidad_inventario",
      DROP COLUMN IF EXISTS "fk_unidad"
    `);
  }
}
