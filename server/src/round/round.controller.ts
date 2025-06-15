import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Request,
    HttpException,
    HttpStatus,
    Param,
} from '@nestjs/common';
import { IsDateString } from 'class-validator';
import { RoundService } from './round.service';
import { JwtAuthGuard } from '../user/jwt-auth.guard';

class CreateRoundDto {
    @IsDateString()
    startTime: string;

    @IsDateString()
    endTime: string;
}

@Controller('round')
export class RoundController {
    constructor(private readonly roundService: RoundService) {}

    @Get('list')
    @UseGuards(JwtAuthGuard)
    async list() {
        return this.roundService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getById(@Param('id') id: string) {
        try {
            const round = await this.roundService.findById(parseInt(id));
            if (!round) {
                throw new HttpException({ message: 'Round not found' }, HttpStatus.NOT_FOUND);
            }
            return round;
        } catch (error) {
            throw new HttpException(
                { message: 'Failed to get round', error: error.message },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() createRoundDto: CreateRoundDto, @Request() req: any) {
        if (!req.user.isAdmin) {
            throw new HttpException(
                { message: 'Access denied. Admin privileges required.' },
                HttpStatus.FORBIDDEN
            );
        }

        try {
            const startTime = new Date(createRoundDto.startTime);
            const endTime = new Date(createRoundDto.endTime);

            return await this.roundService.create(startTime, endTime);
        } catch (error) {
            throw new HttpException(
                { message: 'Failed to create round', error: error.message },
                HttpStatus.BAD_REQUEST
            );
        }
    }
}
