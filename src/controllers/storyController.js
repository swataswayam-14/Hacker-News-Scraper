import { prisma } from '../utils/prisma.js';
import { Story } from '../models/Story.js';
import { ApiError } from '../middleware/errorHandler.js';

class StoryController {
  async getRecentStoriesCount(req, res) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const count = await prisma.story.count({
      where: {
        createdAt: {
          gte: fiveMinutesAgo
        }
      }
    });

    res.json({ count });
  }

  async getAllStories(req, res) {
    const { page, limit } = req.pagination;
    const skip = (page - 1) * limit;
  
    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.story.count()
    ]);
  
    res.json({
      stories: stories.map(Story.toJSON),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  }  

  async getStoriesByDate(req, res) {
    const { startDate, endDate } = req.query;
    
    const stories = await prisma.story.findMany({
      where: {
        createdAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ stories: stories.map(Story.toJSON) });
  }

  async getStoryById(req, res) {
    const { id } = req.params;
    const story = await prisma.story.findUnique({
      where: { id: Number(id) }
    });

    if (!story) {
      throw new ApiError(404, 'Story not found');
    }

    res.json(Story.toJSON(story));
  }

  async getStoriesStats(req, res) {
    try {
      const stats = await prisma.$transaction([
        prisma.story.count(),
        prisma.story.aggregate({
          _avg: { points: true, commentsCount: true },
          _max: { points: true, commentsCount: true },
          _min: { points: true, commentsCount: true }
        }),
  
        prisma.story.groupBy({
          by: ['author'],
          _count: { author: true },
          orderBy: { _count: { author: 'desc' } },
          take: 5
        }),
  
        prisma.story.findMany({
          orderBy: { commentsCount: 'desc' },
          take: 5,
          select: {
            title: true,
            author: true,
            commentsCount: true
          }
        })
      ]);
  
      const [totalStories, pointsAndCommentsStats, topAuthors, mostCommentedStories] = stats;
  
      res.json({
        totalStories,
        averagePoints: Math.round(pointsAndCommentsStats._avg.points || 0),
        highestPoints: pointsAndCommentsStats._max.points || 0,
        lowestPoints: pointsAndCommentsStats._min.points || 0,
        averageComments: Math.round(pointsAndCommentsStats._avg.commentsCount || 0),
        highestComments: pointsAndCommentsStats._max.commentsCount || 0,
        lowestComments: pointsAndCommentsStats._min.commentsCount || 0,
        topAuthors: topAuthors.map(author => ({
          name: author.author,
          stories: author._count.author
        })),
        mostCommentedStories
      });
    } catch (error) {
      console.error('Error fetching stories stats:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }  
}

export const storyController = new StoryController();