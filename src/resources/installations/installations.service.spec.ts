import { Test, TestingModule } from '@nestjs/testing';
import { InstallationsService } from './installations.service';

describe('InstallationsService', () => {
  let service: InstallationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstallationsService],
    }).compile();

    service = module.get<InstallationsService>(InstallationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
