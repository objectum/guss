import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tap } from './tap.entity';
import { Round } from '../round/round.entity';

@Injectable()
export class TapService {
    constructor(
        @InjectRepository(Tap)
        private tapRepository: Repository<Tap>,
        @InjectRepository(Round)
        private roundRepository: Repository<Round>
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

        let tap = await this.tapRepository.findOne({
            where: { user_id, round_id },
        });

        if (tap) {
            // Увеличиваем счётчик только если пользователь не Никита
            if (isNikita !== true) {
                await this.tapRepository.query('UPDATE tap SET count = count + 1 WHERE id = $1', [
                    tap.id,
                ]);
            }
            tap = await this.tapRepository.findOne({ where: { id: tap.id } });
        } else {
            // Создаём новый tap с начальным значением 1, если пользователь не Никита, иначе 0
            const initialCount = isNikita !== true ? 1 : 0;
            tap = this.tapRepository.create({
                user_id,
                round_id,
                count: initialCount,
            });
            tap = await this.tapRepository.save(tap);
        }

        const score = this.calculateScore(tap.count);
        return { tap, score };
    }

    calculateScore(tapCount: number): number {
        const baseScore = tapCount;
        const bonusScore = Math.floor(tapCount / 11) * 10;
        return baseScore + bonusScore;
    }

    async getUserScoreForRound(user_id: number, round_id: number): Promise<number> {
        const tap = await this.tapRepository.findOne({
            where: { user_id, round_id },
        });
        return tap ? this.calculateScore(tap.count) : 0;
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
            const score = this.calculateScore(tap.count);
            if (score > maxScore) {
                maxScore = score;
                leader = tap.user.username;
            }
        }

        return leader;
    }
}
