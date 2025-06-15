import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { UserService } from './user.service';

class AuthDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('auth')
    async authenticate(@Body() authDto: AuthDto) {
        try {
            const result = await this.userService.authenticate(authDto.username, authDto.password);
            return result;
        } catch (error) {
            throw new HttpException(
                { message: 'Authentication failed', error: error.message },
                HttpStatus.UNAUTHORIZED
            );
        }
    }
}
