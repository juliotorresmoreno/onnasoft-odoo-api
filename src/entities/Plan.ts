import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { PlanTranslation } from './PlanTranslation';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  anualPrice: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  stripePriceId: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  stripeAnualPriceId: string;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => PlanTranslation, (translation) => translation.plan, {
    cascade: true,
  })
  @JoinColumn()
  translations: PlanTranslation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
