import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lotes } from '../../lotes/entities/lote.entity';
import { UnidadesMedida } from '../../unidades-medida/entities/unidades-medida.entity';
import { Caracteristicas } from '../../caracteristicas/entities/caracteristica.entity';

@Entity('productos', { schema: 'public' })
export class Productos {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id_producto' })
  idProducto: number;

  @Column('character varying', { name: 'codigo', length: 50, unique: true })
  codigo: string;

  @Column('character varying', { name: 'nombre', length: 100 })
  nombre: string;

  @Column('character varying', { name: 'descripcion', nullable: true, length: 255 })
  descripcion: string;

  @Column('character varying', { name: 'imagen', nullable: true, length: 255 })
  imagen: string;

  @Column('boolean', { name: 'estado', default: true })
  estado: boolean;

  @Column('timestamp without time zone', { name: 'created_at', default: () => 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;

  @ManyToOne(() => UnidadesMedida, (unidadesMedida) => unidadesMedida.productos, { nullable: true })
  @JoinColumn([{ name: 'fk_unidad_medida', referencedColumnName: 'idUnidad' }])
  fkUnidadMedida: UnidadesMedida;

  @ManyToOne(() => Caracteristicas, (caracteristica) => caracteristica.productos, { nullable: true })
  @JoinColumn([{ name: 'fk_caracteristica', referencedColumnName: 'idCaracteristica' }])
  fkCaracteristica: Caracteristicas;

  // Relación con Lotes
  @OneToMany(() => Lotes, (lotes) => lotes.producto)
  lotes: Lotes[];
}
