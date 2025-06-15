import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Round } from './round.entity';
import { TapService } from '../tap/tap.service';

@Injectable()
export class RoundService {
    constructor(
        @InjectRepository(Round)
        private roundRepository: Repository<Round>,
        @Inject(forwardRef(() => TapService))
        private tapService: TapService
    ) {}

    async findAll(): Promise<any[]> {
        const rounds = await this.roundRepository.find({
            order: {
                startTime: 'DESC',
            },
        });

        const roundsWithLeaders = await Promise.all(
            rounds.map(async round => {
                const leader = await this.tapService.getLeaderForRound(round.id);
                return {
                    ...round,
                    leader,
                };
            })
        );

        return roundsWithLeaders;
    }

    async create(startTime: Date, endTime?: Date): Promise<Round> {
        const round = this.roundRepository.create({
            startTime,
            endTime,
        });
        return this.roundRepository.save(round);
    }

    async findById(id: number): Promise<any | null> {
        const round = await this.roundRepository.findOne({ where: { id } });
        if (!round) {
            return null;
        }

        const leader = await this.tapService.getLeaderForRound(round.id);
        return {
            ...round,
            leader,
        };
    }
}
