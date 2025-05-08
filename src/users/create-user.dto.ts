import { IsEmail, IsNotEmpty, Matches, MinLength } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty({ message: 'password is required' })
  @MinLength(6)
  @Matches(/[A-Z]/, { message: 'password must contain at least 1 uppercase letter' })
  @Matches(/\d/, { message: 'password must contain at least 1 number' })
  @Matches(/[^A-Za-z0-9]/, { message: 'password must contain at least 1 special character' })
  password: string;
}