import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('round')
export class Round {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'timestamp', nullable: true })
    startTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    endTime: Date;
}
