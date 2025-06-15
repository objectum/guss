import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService
    ) {}

    async authenticate(username: string, password: string): Promise<{ accessToken: string }> {
        let user = await this.userRepository.findOne({ where: { username } });

        if (user) {
            if (password !== user.password) {
                throw new Error('Invalid password');
            }
        } else {
            user = this.userRepository.create({ username, password });
            await this.userRepository.save(user);
        }

        const payload = {
            username: user.username,
            sub: user.id,
            isAdmin: username === 'admin',
            isNikita: username === 'Никита',
        };
        const accessToken = this.jwtService.sign(payload);

        return { accessToken };
    }

    async findById(id: number): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { username } });
    }
}
