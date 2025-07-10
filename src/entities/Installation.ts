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

@Entity('installations')
export class Installation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  domain: string;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.installation, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  version: string;

  @Column({ nullable: true })
  edition: string;

  @Column({ nullable: true })
  licenseKey: string;

  @Column({ nullable: true })
  database: string;

  @Column({ nullable: true })
  subscriptionId: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
