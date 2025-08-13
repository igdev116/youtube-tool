"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const bodyParser = require("body-parser");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(bodyParser.text({
        type: ['application/atom+xml', 'application/xml', 'text/xml'],
        limit: '1mb',
    }));
    app.enableCors({
        origin: process.env.APP_URL || 'http://localhost:3000',
        credentials: true,
    });
    const port = process.env.PORT ?? 4000;
    await app.listen(port);
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log(process.env.APP_URL);
    console.log(`📱 Telegram Bot Token: ${process.env.TELEGRAM_BOT_TOKEN ? 'Loaded ✅' : 'Missing ❌'}`);
}
void bootstrap();
//# sourceMappingURL=main.js.map