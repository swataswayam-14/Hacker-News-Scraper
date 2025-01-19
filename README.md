# Hacker News Real-Time Scraper

A Node.js service that scrapes Hacker News stories in real-time and provides both REST API and WebSocket endpoints for accessing the data.

## Features

- Real-time story scraping from Hacker News
- WebSocket streaming for live updates
- REST API for story retrieval and statistics
- PostgreSQL database integration using Prisma
- Automatic data scraping at configurable intervals
- Error handling and logging
- Health monitoring endpoint

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone `https://github.com/swataswayam-14/Hacker-News-Scraper.git`
cd hacker-news-scraper
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash

cp .env.example .env

PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/hackernews"
SCRAPE_INTERVAL=300000  
LOG_LEVEL=info
```

4. Set up the database:
```bash
npm run prisma:generate

npm run prisma:migrate
```

## Running the Application

1. Start the server:
```bash
npm run dev

npm start
```

2. The server will start at `http://localhost:3000`

## API Documentation

### REST Endpoints

#### Get All Stories
```
GET /api/stories
```
Query Parameters:
- `page` (default: 1)
- `limit` (default: 10)

Response:
```json
{
  "stories": [
    {
      "id": 1,
      "hackerNewsId": 123456,
      "title": "Example Story",
      "url": "https://example.com",
      "points": 100,
      "author": "user123",
      "commentsCount": 10,
      "comments": [
        "first comment",
        "second comment"
      ],
      "createdAt": "2024-01-19T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}

```

#### Get Stories by Date Range
```
GET /api/stories/by-date
```
Query Parameters:
- `startDate` (ISO format)
- `endDate` (ISO format)

#### Get Recent Stories Count
```
GET /api/stories/recent-count
```

#### Get Story Statistics
```
GET /api/stories/stats/summary
```

#### Get Story by ID
```
GET /api/stories/:id
```

### WebSocket API

#### Connection
```javascript
const ws = new WebSocket('ws://localhost:3000');
```

#### Message Types

##### Stories in last 5 minutes
1. Initial Connection Response:
```json
{
  "type": "INITIAL_COUNT",
  "count": 42 
}
```

2. Request Recent Stories:
```json
# Send
{
  "type": "REQUEST_STORIES"
}

# Receive
{
  "type": "RECENT_STORIES",
  "stories": [] 
}
```

3. New Story Broadcast:
```json
{
  "type": "NEW_STORY",
  "story": {} 
}
```

## Testing the Application

### Testing REST APIs

You can use tools like Postman/curl or navigate to `http://localhost:3000/docs` to test the REST endpoints:

```bash
# Get all stories
curl http://localhost:3000/api/stories

# Get stories with pagination
curl http://localhost:3000/api/stories?page=1&limit=10

# Get stories by date range
curl http://localhost:3000/api/stories/by-date?startDate=2024-01-01T00:00:00Z&endDate=2024-01-19T23:59:59Z

# Get statistics
curl http://localhost:3000/api/stories/stats/summary
```

### Testing WebSocket Connection

1. Using the Built-in Test Client:
   - Access `http://localhost:3000/ws-test`
   - Use the UI to connect, disconnect, and request stories

2. Using Postman:
   - Create a new WebSocket request
   - Connect to `ws://localhost:3000`
   - Send test messages:
     ```json
     {"type": "REQUEST_STORIES"}
     ```

3. Using wscat:
```bash
# Install wscat
npm install -g wscat

# Connect to server
wscat -c ws://localhost:3000

# Send test message
{"type":"REQUEST_STORIES"}
```

## Health Check

Monitor the application health:
```bash
curl http://localhost:3000/health
```

## Monitoring and Logs

Logs are written to:
- `error.log`: Error-level logs
- `combined.log`: All logs
- Console output in development

## Development

### Project Structure
```
hacker-news-scraper/
├── prisma/
│   └── schema.prisma        # Database schema
├── src/
    ├── config/              # Configuration files
    ├── controllers/         # Request handlers
    ├── middleware/          # Express middleware
    ├── models/              # Data models
    ├── routes/              # API routes
    ├── services/            # Business logic
    ├── utils/               # Utilities
    ├── websocket/           # WebSocket handling
    └── index.js             # Application entry
```
