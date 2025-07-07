import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Plan } from './Plan';
import { defaultLanguage, Language, languages } from '@/utils/language';

@Entity('plan_translations')
@Unique(['plan', 'locale'])
export class PlanTranslation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: languages,
    default: defaultLanguage,
    nullable: false,
    comment: 'Language code for the translation',
  })
  locale: Language;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  features: string[];

  @ManyToOne(() => Plan, (plan) => plan.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'planId' })
  plan: Plan;

  @Column()
  planId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
