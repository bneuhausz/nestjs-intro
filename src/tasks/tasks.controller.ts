import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PaginationResponse } from '../common/pagination.response';
import { CreateTaskDto } from './create-task.dto';
import { PaginationParams } from '../common/pagination.params';
import { FindOneParams } from './find-one.params';
import { UpdateTaskDto } from './update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { CreateTaskLabelDto } from './create-task-label.dto';
import { FindTaskParams } from './find-task.params';
import { Task } from './task.entity';
import { CurrentuserId } from '../users/decorators/current-user-id.decorator';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(
    @Query() filters: FindTaskParams,
    @Query() pagination: PaginationParams,
    @CurrentuserId() userId: string
  ): Promise<PaginationResponse<Task>> {
    const [items, total] = await this.tasksService.findAll(filters, pagination, userId);
    return {
      data: items,
      meta: {
        total,
        ...pagination,
      },
    };
  }

  @Get(':id')
  async findOne(@Param() params: FindOneParams, @CurrentuserId() userId: string) {
    const task = await this.findOneOrFail(params.id);
    this.checkTaskOwnership(task, userId);
    return task;
  }

  @Post()
  async create(@Body() createTaskDto: CreateTaskDto, @CurrentuserId() userId: string) {
    return await this.tasksService.createTask(
      {
        ...createTaskDto,
        userId,
      });
  }

  @Patch(':id')
  async updateTask(@Param() params: FindOneParams, @Body() updateTaskDto: UpdateTaskDto, @CurrentuserId() userId: string) {
    const task = await this.findOneOrFail(params.id);
    this.checkTaskOwnership(task, userId);
    try {
      return await this.tasksService.updateTask(task, updateTaskDto);
    } catch (error) {
      if (error instanceof WrongTaskStatusException) {
        throw new BadRequestException([error.message]);
      }
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@Param() params: FindOneParams, @CurrentuserId() userId: string) {
    const task = await this.findOneOrFail(params.id);
    this.checkTaskOwnership(task, userId);
    await this.tasksService.deleteTask(task);
  }

  @Post(':id/labels')
  async addLabels(@Param() { id }: FindOneParams, @Body() labels: CreateTaskLabelDto[], @CurrentuserId() userId: string) {
    const task = await this.findOneOrFail(id);
    this.checkTaskOwnership(task, userId);
    return await this.tasksService.addLabels(task, labels);
  }

  @Delete(':id/labels')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeLabels(@Param() { id }: FindOneParams, @Body() labelNames: string[], @CurrentuserId() userId: string) {
    const task = await this.findOneOrFail(id);
    this.checkTaskOwnership(task, userId);
    await this.tasksService.removeLabels(task, labelNames);
  }

  private async findOneOrFail(id: string) {
    const task = await this.tasksService.findOne(id);
    if (!task) {
      throw new NotFoundException;
    }
    return task;
  }

  private checkTaskOwnership(task: Task, userId: string) {
    if (task.userId !== userId) {
      throw new ForbiddenException('You can only access your own tasks');
    }
  }
}
