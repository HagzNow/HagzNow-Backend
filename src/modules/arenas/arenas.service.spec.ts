import { Test, TestingModule } from '@nestjs/testing';
import { ArenasService } from './arenas.service';

describe('ArenasService', () => {
  let service: ArenasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArenasService],
    }).compile();

    service = module.get<ArenasService>(ArenasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
