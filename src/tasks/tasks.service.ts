import { Injectable } from '@nestjs/common';
import { TaskStatus } from './task.model';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { CreateTaskLabelDto } from './create-task-label.dto';
import { TaskLabel } from './task-label.entity';
import { FindTaskParams } from './find-task.params';
import { PaginationParams } from '../common/pagination.params';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @InjectRepository(TaskLabel)
    private readonly labelsRepository: Repository<TaskLabel>,
  ) { }

  async findAll(filters: FindTaskParams, pagination: PaginationParams, userId: string) {
    const query = this.tasksRepository.createQueryBuilder('task')
      .leftJoinAndSelect('task.labels', 'labels')
      .where('task.userId = :userId', { userId });

    if (filters.status) {
      query.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters.search?.trim()) {
      query.andWhere('task.title ILIKE :search OR task.description ILIKE :search', { search: `%${filters.search}%` });
    }

    if (filters.labels?.length) {
      const subQuery = query.subQuery()
        .select('labels.taskId')
        .from('task_label', 'labels')
        .where('labels.name IN (:...names)', { names: filters.labels })
        .getQuery();

      query.andWhere(`task.id IN ${subQuery}`);
    }

    query.orderBy(`task.${filters.sortBy}`, filters.sortOrder);

    query.skip(pagination.offset).take(pagination.limit);

    return await query.getManyAndCount();
  }

  async findOne(id: string) {
    return await this.tasksRepository.findOne({
      where: { id },
      relations: ['labels'],
    });
  }

  async createTask(createTaskDto: CreateTaskDto) {
    if (createTaskDto.labels) {
      createTaskDto.labels = this.getUniqueLabels(createTaskDto.labels);
    }
    return await this.tasksRepository.save(createTaskDto);
  }

  async updateTask(task: Task, updateTaskDto: UpdateTaskDto) {
    if (updateTaskDto.status && !this.isValidStatusTransition(task.status, updateTaskDto.status)) {
      throw new WrongTaskStatusException();
    }

    if (updateTaskDto.labels) {
      updateTaskDto.labels = this.getUniqueLabels(updateTaskDto.labels);
    }

    Object.assign(task, updateTaskDto);
    return await this.tasksRepository.save(task);
  }

  async deleteTask(task: Task) {
    await this.tasksRepository.remove(task);
  }

  async addLabels(task: Task, labelDtos: CreateTaskLabelDto[]) {
    const names = new Set(task.labels.map(label => label.name));
    const labels = this.getUniqueLabels(labelDtos)
      .filter(dto => !names.has(dto.name))
      .map(label => this.labelsRepository.create(label));

    if (labels.length) {
      task.labels = [...task.labels, ...labels];
      return await this.tasksRepository.save(task);
    }

    return task;
  }

  public async removeLabels(task: Task, labelToRemove: string[]) {
    task.labels = task.labels.filter(label => !labelToRemove.includes(label.name));
    await this.tasksRepository.save(task);
  }

  private isValidStatusTransition(currentStatus: TaskStatus, newStatus: TaskStatus) {
    const statusOrder = [
      TaskStatus.OPEN,
      TaskStatus.IN_PROGRESS,
      TaskStatus.DONE,
    ];
    return statusOrder.indexOf(currentStatus) <= statusOrder.indexOf(newStatus);
  }

  private getUniqueLabels(labelDtos: CreateTaskLabelDto[]) {
    const uniqueNames = [...new Set(labelDtos.map(label => label.name))];
    return uniqueNames.map(name => ({ name }));
  }
}
