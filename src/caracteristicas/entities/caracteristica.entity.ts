import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Productos } from '../../productos/entities/producto.entity';

@Entity('caracteristicas')
export class Caracteristicas {
  @PrimaryGeneratedColumn({ name: 'id_caracteristica' })
  idCaracteristica: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion: string;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Productos, (producto) => producto.fkCaracteristica)
  productos: Productos[];
}
