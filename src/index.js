import express from 'express';
import http from 'http';
import { config } from './config/config.js';
import { logger } from './utils/logger.js';
import { prisma } from './utils/prisma.js';
import { errorHandler } from './middleware/errorHandler.js';
import { storyRoutes } from './routes/storyRoutes.js';
import { initializeWebSocket } from './websocket/server.js';
import { startScraperService } from './services/scrapperService.js';
import { docsRoutes } from './routes/docsRoutes.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/ws-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'websocket/test-client/index.html'));
});
app.use('/api/stories', storyRoutes);
app.use('/docs', docsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const server = http.createServer(app);
initializeWebSocket(server);

server.listen(config.port, async () => {
  try {
    await prisma.$connect();
    logger.info('Successfully connected to database');
    startScraperService();
    
    logger.info(`Server is running on port ${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
});
const shutdownGracefully = async () => {
  logger.info('Shutting down gracefully...');
  
  try {
    await prisma.$disconnect();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdownGracefully);
process.on('SIGINT', shutdownGracefully);

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});