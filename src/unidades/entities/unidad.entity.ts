import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Lotes } from '../../lotes/entities/lote.entity';

export type EstadoUnidad = 'DISPONIBLE' | 'VENDIDA' | 'DEGUSTACION' | 'ALIANZA' | 'OTRO';

@Entity('unidades', { schema: 'public' })
export class Unidades {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id_unidad' })
  idUnidad: number;

  // Código interno del sistema (autogenerado)
  @Column('character varying', { name: 'codigo_unidad', length: 100, unique: true })
  codigoUnidad: string;

  // Identificador único ingresado por el usuario (ej: número de serie, código de barras)
  @Column('character varying', { name: 'identificador_usuario', length: 100, nullable: true })
  @Index('idx_unidades_identificador_usuario')
  identificadorUsuario: string;

  @Column('character varying', { name: 'estado', length: 20, default: 'DISPONIBLE' })
  estado: EstadoUnidad;

  @Column('timestamp without time zone', { name: 'created_at', default: () => 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'now()' })
  updatedAt: Date;

  // Relación con Lote
  @ManyToOne(() => Lotes, (lote) => lote.unidades)
  @JoinColumn([{ name: 'fk_lote', referencedColumnName: 'idLote' }])
  lote: Lotes;
}
