import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { Lotes } from '../../lotes/entities/lote.entity';

@Entity('movimientos', { schema: 'public' })
export class Movimientos {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id_movimiento' })
  idMovimiento: number;

  @Column('character varying', { name: 'tipo', length: 20 })
  tipo: string; // 'VENTA', 'NO_VENTA'

  // Campo para especificar el tipo de no venta: 'DEGUSTACION', 'ALIANZA', 'OTRO'
  @Column('character varying', { name: 'tipo_no_venta', length: 20, nullable: true })
  tipoNoVenta: string;

  @Column('integer', { name: 'cantidad_vendida', default: 0 })
  cantidadVendida: number;

  @Column('integer', { name: 'cantidad_degustacion', default: 0 })
  cantidadDegustacion: number;

  @Column('integer', { name: 'cantidad_alianza', default: 0 })
  cantidadAlianza: number;

  // Campo para cantidad de tipo "OTRO"
  @Column('integer', { name: 'cantidad_otro', default: 0 })
  cantidadOtro: number;

  @Column('integer', { name: 'cantidad_total' })
  cantidadTotal: number;

  @Column('decimal', { name: 'precio_unitario', precision: 12, scale: 2 })
  precioUnitario: number;

  @Column('decimal', { name: 'precio_total', precision: 12, scale: 2 })
  precioTotal: number; // Solo se cobra lo vendido

  @Column('character varying', { name: 'descripcion', nullable: true, length: 255 })
  descripcion: string;

  @Column({ name: 'fecha_movimiento', type: 'date' })
  fechaMovimiento: Date;

  @Column('timestamp without time zone', { name: 'created_at', default: () => 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;

  // Relación con Lote
  @ManyToOne(() => Lotes, (lote) => lote.movimientos)
  @JoinColumn([{ name: 'fk_lote', referencedColumnName: 'idLote' }])
  lote: Lotes;

  // Calcular totales antes de insertar
  @BeforeInsert()
  calcularTotales() {
    this.cantidadTotal = this.cantidadVendida + this.cantidadDegustacion + this.cantidadAlianza + this.cantidadOtro;
    // Solo se cobra lo vendido
    this.precioTotal = this.cantidadVendida * this.precioUnitario;
  }
}
