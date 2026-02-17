import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lotes } from '../../lotes/entities/lote.entity';
import { MateriasPrimas } from '../../materias-primas/entities/materia-prima.entity';

@Entity('lote_materia_prima', { schema: 'public' })
export class LoteMateriaPrima {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id_lote_materia_prima' })
  idLoteMateriaPrima: number;

  @Column('decimal', { name: 'cantidad', precision: 12, scale: 2 })
  cantidad: number;

  @Column('decimal', { name: 'costo_unitario', precision: 12, scale: 2 })
  costoUnitario: number;

  @Column('decimal', { name: 'costo_total', precision: 12, scale: 2 })
  costoTotal: number;

  @Column('timestamp without time zone', { name: 'created_at', default: () => 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;

  // Relación con Lote
  @ManyToOne(() => Lotes, (lote) => lote.materiasPrimas)
  @JoinColumn([{ name: 'fk_lote', referencedColumnName: 'idLote' }])
  lote: Lotes;

  // Relación con Materia Prima
  @ManyToOne(() => MateriasPrimas, (materiaPrima) => materiaPrima.lotes)
  @JoinColumn([{ name: 'fk_materia_prima', referencedColumnName: 'idMateriaPrima' }])
  materiaPrima: MateriasPrimas;
}