import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('inventarios', { schema: 'public' })
export class Inventarios {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id_inventario' })
  idInventario: number;

  @Column('character varying', { name: 'nombre', nullable: true, length: 100 })
  nombre: string;

  @Column('boolean', { name: 'estado', default: true })
  estado: boolean;

  @Column('timestamp without time zone', {
    name: 'created_at',
    default: () => 'now()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: 'timestamp',
    default: () => "now()",
  })
  updatedAt: Date;
}
