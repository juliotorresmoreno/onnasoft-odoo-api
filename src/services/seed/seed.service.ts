import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from '@/entities/Plan';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async onApplicationBootstrap() {
    await this.planRepository.save([
      {
        id: '95e60216-624e-42f8-ae7a-10a824b7b00e',
        name: 'Starter',
        description: 'For individuals and freelancers',
        price: 99,
        stripePriceId: 'price_starter',
        active: true,
      },
      {
        id: '305ca76f-b719-480e-bccd-3847fa6766d1',
        name: 'Business',
        description: 'For small and medium businesses',
        price: 299,
        stripePriceId: 'price_business',
        active: true,
      },
      {
        id: '70c5df85-080d-49a1-80af-62903ee8e1d0',
        name: 'Enterprise',
        description: 'For large organizations with advanced needs',
        price: 799,
        stripePriceId: 'price_enterprise',
        active: true,
      },
    ]);
  }
}
