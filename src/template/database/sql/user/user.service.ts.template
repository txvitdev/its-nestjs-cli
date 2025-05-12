import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
import { Repository } from 'typeorm'
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
    })
  }

  async findOneBy(conditions: Record<any, any>): Promise<User> {
    return this.userRepository.findOneBy(conditions)
  }

  async firstOrCreate(walletAddress: string): Promise<User> {
    let user = await this.findOneBy({ walletAddress })

    if (!user) {
      user = this.userRepository.create({ walletAddress })
      await this.userRepository.save(user)
    }

    return user
  }
}
