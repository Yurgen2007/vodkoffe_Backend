import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Usuarios } from '../../usuarios/entities/usuario.entity';

@Entity('notificaciones')
export class Notificaciones {
  @PrimaryGeneratedColumn({ name: 'id_notificacion' })
  idNotificacion: number;

  @Column({ type: 'varchar', length: 205 })
  titulo: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  mensaje: string;

  @Column({ type: 'boolean', default: false })
  leido: boolean;

  @Column({ type: 'boolean', default: false, name: 'requiere_accion' })
  requiereAccion: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'estado' })
  estado?: 'aceptado' | 'cancelado' | 'enProceso'| null; 

  @Column({ type: 'jsonb', nullable: true })
  data: any; 

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Usuarios)
  @JoinColumn({ name: 'fk_usuario' })
  fkUsuario: Usuarios;
}
