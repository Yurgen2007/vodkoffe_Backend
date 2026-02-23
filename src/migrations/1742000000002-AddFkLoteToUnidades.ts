import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFkLoteToUnidades1742000000002 implements MigrationInterface {
  name = 'AddFkLoteToUnidades1742000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar la columna fk_lote si no existe
    await queryRunner.query(`
      ALTER TABLE IF EXISTS "unidades" 
      ADD COLUMN IF NOT EXISTS "fk_lote" integer REFERENCES "lotes"("id_lote") ON DELETE CASCADE ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No eliminamos la columna en caso de que tenga datos
  }
}
