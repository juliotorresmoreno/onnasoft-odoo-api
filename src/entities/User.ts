import { Language, languages } from '@/utils/language';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from './Company';
import { Role } from '@/types/role';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  firstName: string;

  @Column({ length: 255 })
  lastName: string;

  @Column({ nullable: true, type: 'varchar', length: 20 })
  phone: string | null;

  @Column({ type: 'varchar' })
  companyId: string;

  @OneToOne(() => Company, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company?: Company;

  @Column({ unique: true })
  email: string;

  @Column({ select: false, type: 'varchar' })
  password: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, type: 'varchar', select: false })
  verificationToken: string | null;

  @Column({ nullable: true, type: 'timestamp', select: false })
  verificationTokenExpiresAt: Date | null;

  @Column({ nullable: true, type: 'varchar', select: false })
  passwordResetToken: string | null;

  @Column({ nullable: true, type: 'timestamp', select: false })
  passwordResetTokenExpiresAt: Date | null;

  @Column({
    type: 'enum',
    enum: languages,
    default: 'en',
  })
  language: Language;

  @Column({ type: 'varchar', length: 100, default: 'UTC' })
  timezone: string;

  @Column({ default: false })
  newsletter: boolean;

  @Column({
    type: 'enum',
    enum: ['free', 'basic', 'pro', 'premium'],
    default: 'free',
  })
  plan: string;

  @Column({
    type: 'enum',
    enum: [Role.User, Role.Admin],
    default: Role.User,
  })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
