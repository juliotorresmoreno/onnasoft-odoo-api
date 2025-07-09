import { Test, TestingModule } from '@nestjs/testing';
import { InstallationsController } from './installations.controller';
import { InstallationService } from './installations.service';

describe('InstallationsController', () => {
  let controller: InstallationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstallationsController],
      providers: [InstallationService],
    }).compile();

    controller = module.get<InstallationsController>(InstallationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
