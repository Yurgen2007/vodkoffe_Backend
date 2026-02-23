import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropElementosTable1742000000001 implements MigrationInterface {
  name = 'DropElementosTable1742000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Eliminar la tabla elementos si existe
    await queryRunner.query(`
      DROP TABLE IF EXISTS "elementos" CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No hay forma de recuperar la tabla sin los datos originales
  }
}
