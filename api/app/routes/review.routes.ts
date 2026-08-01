import { Router } from 'express';
import {
  getReview,
  listAllowedReposHandler,
  listReviewsHandler,
  publishReview,
  startReview,
} from '../controllers/review.controller';

const reviewRouter = Router();

reviewRouter.post('/', startReview);
reviewRouter.get('/', listReviewsHandler);
reviewRouter.get('/allowed-repos', listAllowedReposHandler);
reviewRouter.get('/:id', getReview);
reviewRouter.post('/:id/publish', publishReview);

export default reviewRouter;
