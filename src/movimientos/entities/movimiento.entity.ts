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
import { Usuarios } from '../../usuarios/entities/usuario.entity';
import { Unidades } from '../../unidades/entities/unidad.entity';

@Entity('movimientos', { schema: 'public' })
export class Movimientos {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id_movimiento' })
  idMovimiento: number;

  @Column('character varying', { name: 'tipo', length: 20 })
  tipo: string; // 'VENTA', 'NO_VENTA', 'INVENTARIO'

  // Campos para ventas
  @Column('integer', { name: 'cantidad_vendida', default: 0 })
  cantidadVendida: number;

  @Column('integer', { name: 'cantidad_degustacion', default: 0 })
  cantidadDegustacion: number;

  @Column('integer', { name: 'cantidad_alianza', default: 0 })
  cantidadAlianza: number;

  @Column('integer', { name: 'cantidad_total' })
  cantidadTotal: number;

  @Column('decimal', { name: 'precio_unitario', precision: 12, scale: 2 })
  precioUnitario: number;

  @Column('decimal', { name: 'precio_total', precision: 12, scale: 2 })
  precioTotal: number; // Solo se cobra lo vendido

  @Column('character varying', { name: 'descripcion', nullable: true, length: 255 })
  descripcion: string;

  // Campo para el nombre del cliente al que se le vende
  @Column('character varying', { name: 'nombre_cliente', nullable: true, length: 255 })
  nombreCliente: string;

  @Column({ name: 'fecha_movimiento', type: 'date' })
  fechaMovimiento: Date;

  // Campos para inventario (entrada, salida, ajuste)
  @Column('character varying', { name: 'tipo_inventario', length: 20, nullable: true })
  tipoInventario: string; // 'entrada', 'salida', 'ajuste'

  @Column('integer', { name: 'cantidad_inventario', default: 0 })
  cantidadInventario: number;

  @Column('timestamp without time zone', { name: 'created_at', default: () => 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;

  // Relación con Lote
  @ManyToOne(() => Lotes, (lote) => lote.movimientos, { nullable: true })
  @JoinColumn([{ name: 'fk_lote', referencedColumnName: 'idLote' }])
  lote: Lotes;

  // Relación con Usuario
  @ManyToOne(() => Usuarios, { nullable: true })
  @JoinColumn([{ name: 'fk_usuario', referencedColumnName: 'idUsuario' }])
  usuario: Usuarios;

  // Relación con Unidad (para inventario)
  @ManyToOne(() => Unidades, { nullable: true })
  @JoinColumn([{ name: 'fk_unidad', referencedColumnName: 'idUnidad' }])
  unidad: Unidades;

  // Calcular totales antes de insertar
  @BeforeInsert()
  calcularTotales() {
    // Si es movimiento de inventario
    if (this.tipo === 'INVENTARIO') {
      this.cantidadTotal = this.cantidadInventario || 0;
    } else {
      // Si es venta o no venta
      this.cantidadTotal = this.cantidadVendida + this.cantidadDegustacion + this.cantidadAlianza;
      // Solo se cobra lo vendido
      this.precioTotal = this.cantidadVendida * this.precioUnitario;
    }
  }
}
