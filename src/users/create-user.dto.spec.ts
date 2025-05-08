import { validate } from "class-validator";
import { CreateUserDto } from "./create-user.dto";

describe('CreateUserDto', () => {
  let dto = new CreateUserDto();

  beforeEach(() => {
    dto = new CreateUserDto();
    dto.email = 'test@test.com';
    dto.name = 'nb';
    dto.password = '123456A#';
  });

  it('should pass complete validation', async () => {
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail email validation', async () => {
    dto.email = 'email';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  const testPassword = async (password: string, message: string) => {
    dto.password = password;

    const errors = await validate(dto);

    const passwordError = errors.find(error => error.property === 'password');
    expect(passwordError).toBeDefined();
    
    const messages = Object.values(passwordError?.constraints ?? {});
    expect(messages).toContain(message);
  }

  it('should fail password uppercase letter validation', async () => {
    await testPassword('abcdfa', 'password must contain at least 1 uppercase letter');
  });

  it('should fail password number validation', async () => {
    await testPassword('abcdfaA', 'password must contain at least 1 number');
  });

  it('should fail password special character validation', async () => {
    await testPassword('abcdfaA1', 'password must contain at least 1 special character');
  });
})