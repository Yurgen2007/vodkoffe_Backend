import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNombreClienteToMovimientos1743600000000
  implements MigrationInterface
{
  name = 'AddNombreClienteToMovimientos1743600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "movimientos" 
      ADD COLUMN IF NOT EXISTS "nombre_cliente" VARCHAR(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "movimientos" 
      DROP COLUMN IF EXISTS "nombre_cliente"
    `);
  }
}
