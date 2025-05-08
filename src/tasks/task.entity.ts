import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TaskStatus } from "./task.model";
import { TaskLabel } from "./task-label.entity";
import { User } from "../users/user.entity";

@Entity()
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false
  })
  title: string;

  @Column({
    type: 'text',
    nullable: false
  })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.OPEN,
  })
  status: TaskStatus;

  @Column()
  userId: string;

  @ManyToOne(() => User, user => user.tasks, { nullable: false })
  user: User;

  @OneToMany(() => TaskLabel, label => label.task, {
    cascade: true,
  })
  labels: TaskLabel[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}