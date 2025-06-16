import {
    Controller,
    Put,
    Get,
    Body,
    UseGuards,
    Request,
    HttpException,
    HttpStatus,
    Param,
} from '@nestjs/common';
import { IsNumber } from 'class-validator';
import { TapService } from './tap.service';
import { JwtAuthGuard } from '../user/jwt-auth.guard';

class TapDto {
    @IsNumber()
    round_id: number;
}

@Controller('tap')
export class TapController {
    constructor(private readonly tapService: TapService) {}

    @Put()
    @UseGuards(JwtAuthGuard)
    async tap(@Body() tapDto: TapDto, @Request() req: any) {
        try {
            const user_id = req.user.sub;
            const isNikita = req.user.isNikita || false;
            const result = await this.tapService.incrementTap(user_id, tapDto.round_id, isNikita);

            return {
                tap: result.tap,
                score: result.score,
            };
        } catch (error) {
            throw new HttpException(
                { message: 'Tap failed', error: error.message },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Get('score/:roundId')
    @UseGuards(JwtAuthGuard)
    async getScore(@Param('roundId') roundId: string, @Request() req: any) {
        try {
            const user_id = req.user.sub;
            const score = await this.tapService.getUserScoreForRound(user_id, parseInt(roundId));
            return { score };
        } catch (error) {
            throw new HttpException(
                { message: 'Failed to get score', error: error.message },
                HttpStatus.BAD_REQUEST
            );
        }
    }
}
