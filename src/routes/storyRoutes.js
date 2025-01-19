import { Router } from 'express';
import { storyController } from '../controllers/storyController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validatePagination, validateTimeRange } from '../middleware/validate.js';

const router = Router();

router.get(
    '/',
    validatePagination,
    asyncHandler(storyController.getAllStories)
  );  

router.get(
  '/recent-count',
  asyncHandler(storyController.getRecentStoriesCount)
);

router.get(
  '/by-date',
  validateTimeRange,
  asyncHandler(storyController.getStoriesByDate)
);

router.get(
  '/:id',
  asyncHandler(storyController.getStoryById)
);

router.get(
  '/stats/summary',
  asyncHandler(storyController.getStoriesStats)
);

export const storyRoutes = router;