import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(
    `📱 Telegram Bot Token: ${process.env.TELEGRAM_BOT_TOKEN ? 'Loaded ✅' : 'Missing ❌'}`,
  );
}

void bootstrap();
