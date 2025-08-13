import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Parse XML từ YouTube PubSub (Atom feed)
  app.use(
    bodyParser.text({
      type: ['application/atom+xml', 'application/xml', 'text/xml'],
      limit: '1mb',
    }),
  );

  app.enableCors({
    origin: process.env.APP_URL || 'http://localhost:3000',
    credentials: true,
  });
  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(process.env.APP_URL);
  console.log(
    `📱 Telegram Bot Token: ${process.env.TELEGRAM_BOT_TOKEN ? 'Loaded ✅' : 'Missing ❌'}`,
  );
}

void bootstrap();
