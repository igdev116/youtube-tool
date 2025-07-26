# 🤖 YouTube Video Monitoring System

Hệ thống theo dõi video YouTube mới và gửi thông báo qua Telegram mỗi 30 giây.

## 🚀 Features

- ✅ Theo dõi video mới từ nhiều YouTube channels
- ✅ Thông báo qua Telegram với thumbnail và links
- ✅ Duplicate detection trong memory (không lưu video vào DB)
- ✅ Quản lý subscriptions qua REST API
- ✅ Custom message cho từng channel
- ✅ Bật/tắt monitoring cho từng channel
- ✅ Manual check và auto check mỗi 30 giây
- ✅ YouTube Scraper (NO quota limits!)
- ✅ Pagination support

## 📋 Setup Requirements

### 1. **MongoDB**

```bash
# Chạy MongoDB trên port 27017
# URI: mongodb://localhost:27017/
```

### 2. **NO YouTube API Key needed!** 🚫

✅ Hệ thống sử dụng YouTube Scraper - không cần API key  
✅ Không có giới hạn quota  
✅ Hoàn toàn miễn phí

### 3. **Telegram Bot Token**

#### Tạo Telegram Bot:

1. Chat với [@BotFather](https://t.me/botfather) trên Telegram
2. Gửi `/newbot`
3. Đặt tên bot và username
4. Copy **Bot Token** (dạng: `123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

#### Lấy Chat ID:

```bash
# Cách 1: Add bot vào group, gửi tin nhắn, sau đó:
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"

# Cách 2: Chat với bot @userinfobot để lấy chat ID
```

### 4. **Cập nhật .env file**

```bash
TELEGRAM_BOT_TOKEN=123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
```

## 🏃‍♂️ Chạy hệ thống

```bash
# 1. Cài dependencies
yarn install

# 2. Start development server
yarn dev

# 3. Kiểm tra logs - sẽ thấy:
# 🔄 Video monitoring: Every 30 seconds
```

## 🧶 Yarn Commands

```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn start:prod   # Start production server
yarn test         # Run tests
yarn lint         # Run linter
yarn format       # Format code
```

## 📚 API Usage

### **1. 🔍 Tìm Channel ID**

```bash
curl "http://localhost:3000/youtube-scraper/find-channel-id?input=pewdiepie"
```

### **2. 📝 Subscribe channel**

```bash
curl -X POST "http://localhost:3000/monitoring/subscribe" \
  -H "Content-Type: application/json" \
  -d '{
    "channelId": "pewdiepie",
    "telegramChatId": "-1001234567890",
    "customMessage": "🎬 Video mới từ PewDiePie!"
  }'
```

### **3. 📋 Xem subscriptions (with pagination)**

```bash
# Basic pagination
curl "http://localhost:3000/monitoring/subscriptions?page=1&limit=10"

# Search and sort
curl "http://localhost:3000/monitoring/subscriptions?search=tech&sortBy=channelTitle&sortOrder=asc"
```

### **4. 🧪 Test Telegram**

```bash
curl -X POST "http://localhost:3000/monitoring/telegram/test" \
  -H "Content-Type: application/json" \
  -d '{"chatId": "-1001234567890"}'
```

### **5. ⚡ Manual check**

```bash
# Check tất cả channels
curl -X POST "http://localhost:3000/monitoring/check"

# Check 1 channel cụ thể
curl -X POST "http://localhost:3000/monitoring/check?channelId=pewdiepie"
```

### **6. 📊 Monitoring status**

```bash
curl "http://localhost:3000/monitoring/status"
```

### **7. 🧹 Cache Management**

```bash
# Xem cache stats
curl "http://localhost:3000/monitoring/cache/stats"

# Clear cache (force reprocess tất cả videos)
curl -X POST "http://localhost:3000/monitoring/cache/clear"
```

### **8. 🔄 Toggle subscription**

```bash
curl -X PUT "http://localhost:3000/monitoring/subscriptions/pewdiepie/toggle?telegramChatId=-1001234567890"
```

### **9. ❌ Unsubscribe**

```bash
curl -X DELETE "http://localhost:3000/monitoring/subscribe" \
  -H "Content-Type: application/json" \
  -d '{
    "channelId": "pewdiepie",
    "telegramChatId": "-1001234567890"
  }'
```

## 🔍 YouTube Scraper APIs

```bash
# Get channel videos with pagination (IMPROVED - exact channel matching!)
curl "http://localhost:3000/youtube-scraper/channel/MrBeast/videos?limit=15"

# Get channel info
curl "http://localhost:3000/youtube-scraper/channel/pewdiepie/info"

# Search videos
curl "http://localhost:3000/youtube-scraper/search?q=javascript tutorial&limit=20"

# Find channel ID from URL/username
curl "http://localhost:3000/youtube-scraper/find-channel-id?input=@pewdiepie"
```

### 🎯 **Channel Video Fetching - IMPROVED!**

Hệ thống đã được cải tiến để lấy videos **chính xác** từ channel cụ thể:

✅ **Before**: Search "MrBeast" → lấy cả videos từ "MrBeast", "MrBeast Gaming", "MrBeast 2"  
✅ **After**: Search "MrBeast" → **chỉ lấy videos từ "MrBeast" chính thức**

**Technical Implementation:**

- Sử dụng `yt-search` library với exact channel matching
- Fallback to `youtube-search-api` nếu không tìm thấy
- Filter chính xác theo channel name và @username variants

## 📱 Telegram Message Format

Khi có video mới, bot sẽ gửi:

```
🎬 Video mới từ PewDiePie!

📹 HOW TO BE HAPPY

📅 Đăng lúc: 15/12/2023, 10:30:00
🔗 Xem ngay
📺 Kênh PewDiePie

#NewVideo #PewDiePie
```

Kèm thumbnail và 2 buttons:

- 🎬 **Xem Video** → Link YouTube
- 📺 **Kênh** → Link Channel

## 🔧 Configuration

### **Thay đổi tần suất check**

File: `src/monitoring/video-monitor.service.ts`

```typescript
// Hiện tại: mỗi 30 giây
@Cron('*/30 * * * * *')

// Thay đổi thành 1 phút:
@Cron('0 * * * * *')

// Thay đổi thành 5 phút:
@Cron('0 */5 * * * *')
```

### **Thay đổi số videos check**

```typescript
// Trong processChannelSubscription
const channelVideos = await this.youtubeScraperService.getChannelVideos(
  subscription.channelTitle, // Scraper dùng title thay vì ID
  5, // Tăng số này để check nhiều videos hơn
);
```

### **Custom message template**

```typescript
// Trong TelegramService.formatVideoMessage()
return `
🎥 <b>Có video mới!</b>
📺 <b>${video.channelTitle}</b>
🎬 ${video.title}
⏰ ${publishedDate}
```

## 🗃️ Database Structure

**Chỉ lưu Channel Subscriptions** (không lưu videos):

### **Channel Subscriptions Collection**

```javascript
{
  channelId: "UC-lHJZR3Gqxm24_Vd_AJ5Yw",
  channelTitle: "PewDiePie",
  telegramChatId: "-1001234567890",
  isActive: true,
  lastCheckedAt: "2023-12-15T10:31:00Z",
  totalNotificationsSent: 15,
  customMessage: "🎬 Video mới từ PewDiePie!"
}
```

**Videos**: Được xử lý trong **memory** để tránh duplicate, không lưu vào DB.

## 🚨 Troubleshooting

### **1. Monitoring không chạy**

```bash
# Check logs xem có lỗi gì
yarn dev

# Kiểm tra database connection
curl "http://localhost:3000/monitoring/status"
```

### **2. Telegram không gửi được**

```bash
# Test connection
curl -X POST "http://localhost:3000/monitoring/telegram/test" \
  -H "Content-Type: application/json" \
  -d '{"chatId": "YOUR_CHAT_ID"}'

# Kiểm tra bot token
echo $TELEGRAM_BOT_TOKEN
```

### **3. YouTube API lỗi**

- Xem `SETUP_API_KEY.md`
- Kiểm tra quota: [Google Cloud Console](https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas)

### **4. MongoDB connection lỗi**

```bash
# Kiểm tra MongoDB chạy chưa
mongosh mongodb://localhost:27017/

# Restart MongoDB nếu cần
brew services restart mongodb/brew/mongodb-community
```
