import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Round } from './round.entity';
import { RoundService } from './round.service';
import { RoundController } from './round.controller';
import { UserModule } from '../user/user.module';
import { TapModule } from '../tap/tap.module';

@Module({
    imports: [TypeOrmModule.forFeature([Round]), UserModule, forwardRef(() => TapModule)],
    controllers: [RoundController],
    providers: [RoundService],
    exports: [RoundService],
})
export class RoundModule {}
