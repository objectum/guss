import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Round } from '../round/round.entity';

@Entity('tap')
export class Tap {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    round_id: number;

    @Column({ type: 'integer', default: 0 })
    count: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Round)
    @JoinColumn({ name: 'round_id' })
    round: Round;
}
