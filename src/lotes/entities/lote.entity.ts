import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { Unidades } from '../../unidades/entities/unidad.entity';
import { LoteMateriaPrima } from '../../lote-materia-prima/entities/lote-materia-prima.entity';
import { Movimientos } from '../../movimientos/entities/movimiento.entity';

@Entity('lotes', { schema: 'public' })
export class Lotes {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id_lote' })
  idLote: number;

  @Column('character varying', { name: 'codigo_lote', length: 50, unique: true })
  codigoLote: string;

  @Column('integer', { name: 'cantidad_unidades', default: 0 })
  cantidadUnidades: number;

  @Column({ name: 'fecha_produccion', type: 'date' })
  fechaProduccion: Date;

  @Column({ name: 'fecha_vencimiento', type: 'date', nullable: true })
  fechaVencimiento: Date;

  @Column('decimal', { name: 'costo_unitario', precision: 12, scale: 2 })
  costoUnitario: number;

  @Column('decimal', { name: 'costo_total', precision: 12, scale: 2 })
  costoTotal: number;

  @Column('decimal', { name: 'costo_materias_primas', precision: 12, scale: 2, default: 0 })
  costoMateriasPrimas: number;

  @Column('boolean', { name: 'estado', default: true })
  estado: boolean;

  @Column('timestamp without time zone', { name: 'created_at', default: () => 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;

  // Relación con Unidades
  @OneToMany(() => Unidades, (unidades) => unidades.lote)
  unidades: Unidades[];

  // Relación con Materias Primas del Lote
  @OneToMany(() => LoteMateriaPrima, (loteMateriaPrima) => loteMateriaPrima.lote)
  materiasPrimas: LoteMateriaPrima[];

  // Relación con Movimientos (ventas, degustaciones, alianzas)
  @OneToMany(() => Movimientos, (movimientos) => movimientos.lote)
  movimientos: Movimientos[];

  // Calcular costo total antes de insertar
  @BeforeInsert()
  calcularCostoTotal() {
    const cantidad = this.cantidadUnidades || 0;
    this.cantidadUnidades = cantidad;
    this.costoTotal = cantidad * (this.costoUnitario || 0);
  }
}
