import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TapController } from './tap.controller';
import { TapService } from './tap.service';
import { Tap } from './tap.entity';
import { Round } from '../round/round.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Tap, Round])],
    controllers: [TapController],
    providers: [TapService],
    exports: [TapService],
})
export class TapModule {}
