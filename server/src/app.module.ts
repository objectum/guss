import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { RoundModule } from './round/round.module';
import { TapModule } from './tap/tap.module';
import { User } from './user/user.entity';
import { Round } from './round/round.entity';
import { Tap } from './tap/tap.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [User, Round, Tap],
            synchronize: true, // В продакшене лучше использовать миграции
        }),
        UserModule,
        RoundModule,
        TapModule,
    ],
})
export class AppModule {}
