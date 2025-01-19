import { WebSocket, WebSocketServer } from 'ws';
import { prisma } from '../utils/prisma.js';
import { logger } from '../utils/logger.js';
import { Story } from '../models/Story.js';

let wss;

export const initializeWebSocket = (server) => {
  wss = new WebSocketServer({ server });

  wss.on('connection', async function connection(ws) {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const count = await prisma.story.count({
        where: {
          createdAt: {
            gte: fiveMinutesAgo
          }
        }
      });

      ws.send(JSON.stringify({
        type: 'INITIAL_COUNT',
        count
      }));
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          switch (data.type) {
            case 'REQUEST_STORIES':
              const recentStories = await prisma.story.findMany({
                orderBy: { createdAt: 'desc' },
                take: 10
              });
              ws.send(JSON.stringify({
                type: 'RECENT_STORIES',
                stories: recentStories.map(Story.toJSON)
              }));
              break;
          }
        } catch (error) {
          logger.error('Error processing WebSocket message:', error);
        }
      });
      ws.on('close', () => {
        logger.info('Client disconnected');
      });

    } catch (error) {
      logger.error('Error sending initial count:', error);
    }
  });

  wss.on('error', (error) => {
    logger.error('WebSocket server error:', error);
  });
  const interval = setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.ping();
      }
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });
};

export const broadcastToClients = (message) => {
  if (!wss) return;

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        logger.error('Error broadcasting to client:', error);
      }
    }
  });
};