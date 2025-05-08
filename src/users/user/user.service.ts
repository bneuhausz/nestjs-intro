import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { PasswordService } from '../password/password.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService
  ) { }

  async findOneByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async createUser(createUserDto: CreateUserDto) {
    const hashedPassword = await this.passwordService.hash(createUserDto.password);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  async findOne(id: string) {
    return this.userRepository.findOneBy({ id });
  }
}
