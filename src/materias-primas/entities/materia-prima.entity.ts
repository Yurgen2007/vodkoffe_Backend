import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UnidadesMedida } from '../../unidades-medida/entities/unidades-medida.entity';
import { LoteMateriaPrima } from '../../lote-materia-prima/entities/lote-materia-prima.entity';

@Entity('materias_primas')
export class MateriasPrimas {
  @PrimaryGeneratedColumn({ name: 'id_materia_prima' })
  idMateriaPrima: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  costoUnitario: number;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'fk_unidad_medida', type: 'integer', nullable: true })
  fkUnidadMedida: number | null;

  @ManyToOne(() => UnidadesMedida, (unidadMedida) => unidadMedida.materiasPrimas, { nullable: true })
  @JoinColumn([{ name: 'fk_unidad_medida', referencedColumnName: 'idUnidad' }])
  unidadMedida: UnidadesMedida;

  @OneToMany(() => LoteMateriaPrima, (loteMateriaPrima) => loteMateriaPrima.materiaPrima)
  lotes: LoteMateriaPrima[];
}
