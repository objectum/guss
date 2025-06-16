import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tap } from './tap.entity';
import { Round } from '../round/round.entity';

@Injectable()
export class TapService {
    constructor(
        @InjectRepository(Tap)
        private tapRepository: Repository<Tap>,
        @InjectRepository(Round)
        private roundRepository: Repository<Round>,
        private dataSource: DataSource
    ) {}

    async incrementTap(
        user_id: number,
        round_id: number,
        isNikita: boolean = false
    ): Promise<{ tap: Tap; score: number }> {
        const round = await this.roundRepository.findOne({ where: { id: round_id } });
        if (!round) {
            throw new Error('Round not found');
        }

        const now = new Date();
        if (now < round.startTime || now > round.endTime) {
            throw new Error('Round is not active');
        }

        return await this.dataSource.transaction(async manager => {
            try {
                let tap = await manager.findOne(Tap, {
                    where: { user_id, round_id },
                    lock: { mode: 'pessimistic_write' },
                });

                if (tap) {
                    if (isNikita !== true) {
                        const newCount = tap.count + 1;
                        const newScore = this.calculateScore(newCount);

                        await manager.update(Tap, tap.id, {
                            count: newCount,
                            score: newScore,
                        });

                        tap.count = newCount;
                        tap.score = newScore;
                    }
                } else {
                    const initialCount = isNikita !== true ? 1 : 0;
                    const initialScore = this.calculateScore(initialCount);

                    const newTap = manager.create(Tap, {
                        user_id,
                        round_id,
                        count: initialCount,
                        score: initialScore,
                    });

                    tap = await manager.save(Tap, newTap);
                }

                return { tap, score: tap.score };
            } catch (error) {
                if (error.code === '23505' || error.message?.includes('duplicate')) {
                    const existingTap = await manager.findOne(Tap, {
                        where: { user_id, round_id },
                    });
                    if (existingTap) {
                        return { tap: existingTap, score: existingTap.score };
                    }
                }
                throw error;
            }
        });
    }

    private calculateScore(tapCount: number): number {
        const baseScore = tapCount;
        const bonusScore = Math.floor(tapCount / 11) * 10;
        return baseScore + bonusScore;
    }

    async getUserScoreForRound(user_id: number, round_id: number): Promise<number> {
        const tap = await this.tapRepository.findOne({
            where: { user_id, round_id },
        });
        return tap ? tap.score : 0;
    }

    async getLeaderForRound(round_id: number): Promise<string | null> {
        const taps = await this.tapRepository.find({
            where: { round_id },
            relations: ['user'],
        });

        if (taps.length === 0) {
            return null;
        }

        let maxScore = 0;
        let leader = null;

        for (const tap of taps) {
            if (tap.score > maxScore) {
                maxScore = tap.score;
                leader = tap.user.username;
            }
        }

        return leader;
    }
}
