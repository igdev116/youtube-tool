# 🤖 YouTube Video Monitoring Tool

Hệ thống theo dõi video YouTube mới và gửi thông báo qua Telegram với **NO quota limits!**

## ✨ Key Features

- 🚫 **NO YouTube API Key needed!**
- ♾️ **NO quota limits** - sử dụng YouTube Scraper
- 📺 **Real-time monitoring** - check mỗi 30 giây
- 📱 **Telegram notifications** với thumbnails và buttons
- 📊 **Pagination support** cho tất cả endpoints
- 🔍 **Search & sort** subscriptions
- 🧶 **Yarn package management**
- 🎯 **Reliable performance**

## 🚀 Quick Start

### 1. Prerequisites

```bash
# MongoDB (port 27017)
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community

# Yarn (if not installed)
npm install -g yarn
```

### 2. Installation

```bash
# Clone and install
git clone <repository-url>
cd youtube-tool
yarn install
```

### 3. Configuration

Create `.env` file:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

### 4. Start Development Server

```bash
yarn dev
```

Server sẽ chạy tại `http://localhost:3000` với đầy đủ API endpoints.

## 🧶 Yarn Commands

| Command           | Description              |
| ----------------- | ------------------------ |
| `yarn dev`        | Start development server |
| `yarn build`      | Build for production     |
| `yarn start:prod` | Start production server  |
| `yarn test`       | Run tests                |
| `yarn lint`       | Run linter               |
| `yarn format`     | Format code              |

## 📋 API Endpoints

### 🔧 Monitoring APIs

- `GET /monitoring/subscriptions` - List subscriptions (with pagination)
- `POST /monitoring/subscribe` - Subscribe to channel
- `DELETE /monitoring/subscribe` - Unsubscribe
- `GET /monitoring/status` - System status

### 🔍 YouTube Scraper APIs (No Quota!)

- `GET /youtube-scraper/find-channel-id?input=CHANNEL_NAME` - Find channel ID
- `GET /youtube-scraper/videos-by-id/CHANNEL_ID?limit=N` - Get videos by channel ID

### 📞 Telegram APIs

- `POST /monitoring/telegram/test` - Test bot connection

## 🎯 Example Usage

### Get videos from a channel:

```bash
# Step 1: Find channel ID
curl "http://localhost:3000/youtube-scraper/find-channel-id?input=MrBeast"

# Step 2: Get videos by channel ID
curl "http://localhost:3000/youtube-scraper/videos-by-id/CHANNEL_ID?limit=10"
```

### Subscribe to a channel:

```bash
curl -X POST "http://localhost:3000/monitoring/subscribe" \
  -H "Content-Type: application/json" \
  -d '{
    "channelId": "pewdiepie",
    "telegramChatId": "-1001234567890",
    "customMessage": "🎬 New PewDiePie video!"
  }'
```

### Get subscriptions with pagination:

```bash
curl "http://localhost:3000/monitoring/subscriptions?page=1&limit=10&search=tech"
```

### Test workflows:

```bash
./test-workflow.sh
```

## 📊 Pagination Support

All endpoints support:

- `page` - Page number (starts from 1)
- `limit` - Items per page (1-100)
- `search` - Search term
- `sortBy` - Sort field
- `sortOrder` - asc/desc

Example response:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 42,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🎉 Migration Benefits

### Before (YouTube API):

- ❌ Complex setup with API keys
- ❌ Daily quota limits (10,000 units)
- ❌ Potential costs after free tier
- ❌ Quota exceeded errors

### After (YouTube Scraper):

- ✅ No setup required
- ✅ Unlimited requests
- ✅ Always free
- ✅ Reliable performance

## 📚 Documentation

- 🔧 [MONITORING_SETUP.md](./MONITORING_SETUP.md) - Setup and usage guide

## 🔧 Configuration

### Telegram Bot Setup:

1. Chat with [@BotFather](https://t.me/botfather)
2. Create new bot with `/newbot`
3. Copy bot token to `.env`

### MongoDB:

- Default: `mongodb://localhost:27017/youtube-tool`
- Automatically connects on startup

## 🎯 Testing

```bash
# Test individual features
curl "http://localhost:3000/monitoring/health"
```

## 🎯 Architecture

- **NestJS** - Backend framework
- **MongoDB** - Database for subscriptions
- **YouTube Scraper** - No-quota video fetching
- **Telegram Bot API** - Notifications
- **Yarn** - Package management
- **Cron Jobs** - Automated monitoring

## 🚀 Production Deployment

```bash
# Build
yarn build

# Start production server
yarn start:prod
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the UNLICENSED License.

---

**🎉 Enjoy unlimited YouTube monitoring with no quota restrictions!**
