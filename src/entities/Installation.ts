import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './User';

export const installationStatus = [
  'active',
  'maintenance',
  'pending',
  'failed',
  'inactive',
] as const;

type InstallationStatus = (typeof installationStatus)[number];

@Entity('installations')
export class Installation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  domain: string;

  @Column({ type: 'varchar', unique: true })
  userId: string;

  @OneToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  version: string;

  @Column({ nullable: true })
  edition: string;

  @Column({ nullable: true, select: false })
  licenseKey: string;

  @Column({ nullable: true })
  database: string;

  @Column({ nullable: true, select: false })
  subscriptionId: string;

  @Column({ nullable: true, select: false })
  stripeCustomerId: string;

  @Column({
    type: 'enum',
    enum: installationStatus,
    default: 'pending',
  })
  status: InstallationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
