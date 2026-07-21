import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  const prisma = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('should return live status', () => {
      expect(appController.getHealth()).toMatchObject({
        status: 'ok',
        service: 'e-pati-api',
      });
    });

    it('should return ready status after database check', async () => {
      await expect(appController.getReady()).resolves.toMatchObject({
        status: 'ready',
        service: 'e-pati-api',
      });
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });
});
