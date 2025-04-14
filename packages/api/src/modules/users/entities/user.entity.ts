import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Bounty } from '../../bounties/entities/bounty.entity';

export enum UserRole {
  CLIENT = 'client',
  DEVELOPER = 'developer',
  DESIGNER = 'designer',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.DEVELOPER,
  })
  role: UserRole;

  @Column({ nullable: true })
  profileImage?: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ nullable: true })
  githubUrl?: string;

  @Column({ nullable: true })
  portfolioUrl?: string;

  @Column({ nullable: true })
  stripeCustomerId?: string;

  @Column({ nullable: true })
  stripeConnectAccountId?: string;

  @OneToMany(() => Bounty, (bounty) => bounty.creator)
  createdBounties: Bounty[];

  @OneToMany(() => Bounty, (bounty) => bounty.assignee)
  assignedBounties: Bounty[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}