import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { User } from '../entity/user.entity.js';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<[User[], number]> {
    const qb = this.repo.createQueryBuilder('user');

    if (search) {
      qb.where(
        'user.fullName ILIKE :search OR user.email ILIKE :search',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return qb.getManyAndCount();
  }

  async findById(id: number): Promise<User | null> {
    return this.repo.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOneBy({ email });
  }

  async findByEmailExcludeId(email: string, excludeId: number): Promise<User | null> {
    return this.repo.findOneBy({ email, id: Not(excludeId) });
  }

  async save(user: User): Promise<User> {
    return this.repo.save(user);
  }

  async create(partial: Partial<User>): Promise<User> {
    const entity = this.repo.create(partial);
    return this.repo.save(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
