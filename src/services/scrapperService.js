import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger.js';
import { prisma } from '../utils/prisma.js';
import { Story } from '../models/Story.js';
import { broadcastToClients } from '../websocket/server.js';
import { config } from '../config/config.js';

class ScraperService {
  constructor() {
    this.baseUrl = 'https://news.ycombinator.com';
    this.isRunning = false;
  }

  async scrapeStories() {
    if (this.isRunning) {
      logger.warn('Scraping already in progress, skipping this iteration');
      return;
    }

    this.isRunning = true;
    try {
      const response = await axios.get(this.baseUrl);
      const $ = cheerio.load(response.data);
      const stories = [];

      $('.athing').each(async (i, element) => {
        const $element = $(element);
        const $subtext = $element.next('.subtext');

        const hackerNewsId = parseInt($element.attr('id'));
        const title = $element.find('.titleline > a').text().trim();
        const url = $element.find('.titleline > a').attr('href');
        const pointsText = $subtext.find('.score').text().trim();
        const points = pointsText ? parseInt(pointsText.split(' ')[0]) : 0; 
        const author = $subtext.find('.hnuser').text().trim() || "Unknown";
        const commentsLink = $subtext.find('a:last-child').text().trim();
        const commentsCount = commentsLink.includes('comment') ? parseInt(commentsLink.split(' ')[0]) : 0; 

        let comments = [];
        if (commentsCount > 0) {
          comments = await this.scrapeComments(hackerNewsId);
        }

        if (hackerNewsId && title) {
          stories.push({ hackerNewsId, title, url, points, author, commentsCount, comments });
        }
      });

      await this.processScrapedStories(stories);
      logger.info(`Successfully scraped ${stories.length} stories`);
    } catch (error) {
      logger.error('Error scraping stories:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async scrapeComments(hackerNewsId) {
    try {
      const response = await axios.get(`https://news.ycombinator.com/item?id=${hackerNewsId}`);
      const $ = cheerio.load(response.data);
      let comments = [];

      $('.comment').each((i, comment) => {
        const text = $(comment).find('.comment').text().trim();
        if (text) comments.push(text);
      });

      return comments.slice(0, 5); 
    } catch (error) {
      logger.error(`Error scraping comments for story ${hackerNewsId}:`, error);
      return [];
    }
  }

  async processScrapedStories(stories) {
    for (const storyData of stories) {
      try {
        const newStory = await prisma.story.upsert({
          where: { hackerNewsId: storyData.hackerNewsId },
          update: {},
          create: Story.fromHackerNews(storyData),
        });

        broadcastToClients({ type: 'NEW_STORY', story: Story.toJSON(newStory) });
      } catch (error) {
        logger.error('Error processing story:', error);
      }
    }
  }
}

export const scraperService = new ScraperService();
export const startScraperService = () => {
  scraperService.scrapeStories();
  setInterval(() => scraperService.scrapeStories(), config.scrapeInterval);
};
