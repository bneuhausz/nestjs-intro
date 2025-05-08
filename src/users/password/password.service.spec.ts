import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash passowrd', async () => {
    const mockHash = 'hashed_password';
    (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);
    const password = 'password123';
    const result = await service.hash(password);

    expect(bcrypt.hash).toHaveBeenCalledWith(password, service['SALT_ROUNDS']);
    expect(result).toBe(mockHash);
  });

  const testCompare = async (mockResult: boolean) => {
    const password = 'password';
    const hashedPassword = 'hashed_password';
    (bcrypt.compare as jest.Mock).mockResolvedValue(mockResult);
    const result = await service.verify(password, hashedPassword);

    expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    expect(result).toBe(mockResult);
  }

  it('should verify password', async () => {
    await testCompare(true);
  });

  it('should fail to verify password', async () => {
    await testCompare(false);
  });
});
