import { Injectable } from '@nestjs/common';

@Injectable()
export class DummyService {
  work(): string {
    return 'Work done!';
  }
}
