import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        })
    );

    app.enableCors({
        origin: [process.env.FRONTEND_URL, 'http://localhost:4000', 'http://localhost:5173'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Referrer-Policy'],
        credentials: true,
    });

    // Добавляем middleware для безопасности и политик
    app.use((req, res, next) => {
        res.header('Referrer-Policy', 'same-origin');
        res.header('X-Content-Type-Options', 'nosniff');
        res.header('X-Frame-Options', 'DENY');
        res.header('X-XSS-Protection', '1; mode=block');

        // Обработка preflight запросов
        if (req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header(
                'Access-Control-Allow-Headers',
                'Content-Type, Authorization, Content-Length, X-Requested-With'
            );
            res.sendStatus(200);
        } else {
            next();
        }
    });

    const port = process.env.PORT || 4000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
