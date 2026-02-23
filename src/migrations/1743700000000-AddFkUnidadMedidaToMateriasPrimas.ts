import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFkUnidadMedidaToMateriasPrimas1743700000000
  implements MigrationInterface
{
  name = 'AddFkUnidadMedidaToMateriasPrimas1743700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar la columna fk_unidad_medida a la tabla materias_primas
    await queryRunner.query(`
      ALTER TABLE "materias_primas" 
      ADD COLUMN "fk_unidad_medida" INTEGER REFERENCES "unidades_medida"("id_unidad")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "materias_primas" 
      DROP COLUMN "fk_unidad_medida"
    `);
  }
}
