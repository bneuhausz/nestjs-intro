import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../create-user.dto';
import { User } from '../user.entity';
import { PasswordService } from '../password/password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) { }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userService.findOneByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException('email already exists');
    }

    const user = await this.userService.createUser(createUserDto);

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);

    if (!user || await this.isPasswordInvalid(password, user.password)) {
      throw new UnauthorizedException('invalid credentials');
    }

    return this.generateToken(user);
  }

  private async isPasswordInvalid(password: string, hashedPassword: string) {
    return !(await this.passwordService.verify(password, hashedPassword));
  }

  private generateToken(user: User) {
    const payload = {
      sub: user.id,
      name: user.name,
      roles: user.roles,
    };

    return this.jwtService.sign(payload);
  }
}
