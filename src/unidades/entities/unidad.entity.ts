import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lotes } from '../../lotes/entities/lote.entity';
import { Inventarios } from '../../inventarios/entities/inventario.entity';
import { Caracteristicas } from '../../caracteristicas/entities/caracteristica.entity';
import { UnidadesMedida } from '../../unidades-medida/entities/unidades-medida.entity';

export type EstadoUnidad = 'DISPONIBLE' | 'VENDIDA' | 'DEGUSTACION' | 'ALIANZA' | 'OTRO' | 'INACTIVO';

@Entity('unidades', { schema: 'public' })
export class Unidades {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id_unidad' })
  idUnidad: number;

  @Column('character varying', { name: 'codigo_unidad', length: 100, unique: true })
  codigoUnidad: string;

  @Column('character varying', { name: 'estado', length: 20, default: 'DISPONIBLE' })
  estado: EstadoUnidad;

  @Column('timestamp without time zone', { name: 'created_at', default: () => 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;

  // FK Lote
  @Column('integer', { name: 'fk_lote', nullable: true })
  fkLote: number | null;

  // FK Inventario
  @Column('integer', { name: 'fk_inventario', nullable: true })
  fkInventario: number | null;

  // FK Característica
  @Column('integer', { name: 'fk_caracteristica', nullable: true })
  fkCaracteristica: number | null;

  // FK Unidad de Medida
  @Column('integer', { name: 'fk_unidad_medida', nullable: true })
  fkUnidadMedida: number | null;

  // Relaciones
  @ManyToOne(() => Lotes, (lote) => lote.unidades, { nullable: true })
  @JoinColumn([{ name: 'fk_lote', referencedColumnName: 'idLote' }])
  lote: Lotes;

  @ManyToOne(() => Inventarios, (inventario) => inventario.unidades, { nullable: true })
  @JoinColumn([{ name: 'fk_inventario', referencedColumnName: 'idInventario' }])
  inventario: Inventarios;

  @ManyToOne(() => Caracteristicas, (caracteristica) => caracteristica.unidades, { nullable: true })
  @JoinColumn([{ name: 'fk_caracteristica', referencedColumnName: 'idCaracteristica' }])
  caracteristica: Caracteristicas;

  @ManyToOne(() => UnidadesMedida, (unidadMedida) => unidadMedida.materiasPrimas, { nullable: true })
  @JoinColumn([{ name: 'fk_unidad_medida', referencedColumnName: 'idUnidad' }])
  unidadMedida: UnidadesMedida;
}
