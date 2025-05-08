import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Task } from "../tasks/task.entity";
import { Expose } from "class-transformer";
import { Role } from "./role.enum";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  @Expose()
  id: string;

  @Column()
  @Expose()
  name: string;

  @Column()
  @Expose()
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  @Expose()
  createdAt: Date;

  @UpdateDateColumn()
  @Expose()
  updatedAt: Date;

  @OneToMany(() => Task, task => task.user)
  @Expose()
  tasks: Task[];

  @Column('text', { array: true, default: [Role.USER] })
  @Expose()
  roles: Role[];
}
