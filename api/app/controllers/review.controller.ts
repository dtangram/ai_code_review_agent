import type { Request, Response } from 'express';
import { runCodeReviewAgent } from '../services/agent.service';
import { publishReviewToGithub, fetchPullRequestTitle } from '../services/github.service';
import { ALLOWED_REPOS, isAllowedRepo } from '../consts/agent.consts';
import {
  completeReview,
  createReview,
  failReview,
  getReviewById,
  listReviews,
} from '../db/models/review.model';
import { closeSse, initSse, sendSseEvent } from '../utils/sse';
import { logServerError } from '../utils/errors';
import { validatePublishReview, validateReviewIdParam, validateReviewRequest } from '../utils/validation';

export const startReview = async (req: Request, res: Response): Promise<void> => {
  const { body } = req;
  const parsed = validateReviewRequest(body);
  // Note: parsed.success / parsed.error / parsed.data are kept as dot notation
  // deliberately — Zod's SafeParseReturnType is a discriminated union, and
  // TypeScript only narrows it via direct property checks on `parsed` itself.
  // Destructuring `success` first would lose that narrowing on `parsed.error`/`.data`.
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const request = parsed.data;
  const { repoOwner, repoName } = request;

  if (!isAllowedRepo(repoOwner, repoName)) {
    res.status(403).json({
      error: `This demo only reviews a fixed set of repos. Allowed: ${ALLOWED_REPOS.join(', ')}`,
    });
    return;
  }

  const { pullNumber } = request;

  let reviewId: string;
  try {
    const prTitle = await fetchPullRequestTitle(repoOwner, repoName, pullNumber);
    const review = await createReview(request, prTitle);
    reviewId = review.id;
  } catch (err) {
    logServerError('startReview:createReview', err);
    res.status(500).json({ error: "Couldn't start the review. Please try again." });
    return;
  }

  initSse(res);

  try {
    const comments = await runCodeReviewAgent(request, (event) => sendSseEvent(res, event));
    await completeReview(reviewId, comments);
    sendSseEvent(res, {
      type: 'done',
      label: 'Saved',
      detail: reviewId,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logServerError('startReview:runCodeReviewAgent', err);
    await failReview(reviewId);
    sendSseEvent(res, {
      type: 'error',
      label: 'Something went wrong while reviewing this pull request. Please try again.',
      timestamp: new Date().toISOString(),
    });
  } finally {
    closeSse(res);
  }
};

export const getReview = async (req: Request, res: Response): Promise<void> => {
  const { params } = req;
  const parsed = validateReviewIdParam(params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { id } = parsed.data;

  let review;
  try {
    review = await getReviewById(id);
  } catch (err) {
    logServerError('getReview', err);
    res.status(500).json({ error: "Couldn't load this review. Please try again." });
    return;
  }

  if (!review) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }

  res.status(200).json(review);
};

export const publishReview = async (req: Request, res: Response): Promise<void> => {
  const { params, body } = req;

  const idParsed = validateReviewIdParam(params);
  if (!idParsed.success) {
    res.status(400).json({ error: idParsed.error.flatten() });
    return;
  }

  const bodyParsed = validatePublishReview(body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  const { id } = idParsed.data;
  const { comments } = bodyParsed.data;

  let review;
  try {
    review = await getReviewById(id);
  } catch (err) {
    logServerError('publishReview:getReviewById', err);
    res.status(500).json({ error: "Couldn't load this review. Please try again." });
    return;
  }

  if (!review) {
    res.status(404).json({ error: 'Review not found' });
    return;
  }

  const { repoOwner, repoName, pullNumber } = review;

  if (!isAllowedRepo(repoOwner, repoName)) {
    res.status(403).json({ error: 'This demo can only publish to a fixed set of repos.' });
    return;
  }

  try {
    const { htmlUrl } = await publishReviewToGithub(repoOwner, repoName, pullNumber, comments);
    res.status(200).json({ htmlUrl });
  } catch (err) {
    logServerError('publishReview:publishReviewToGithub', err);
    res.status(502).json({
      error: "Couldn't publish the review to GitHub. Please try again, or check that the PR still exists.",
    });
  }
};

export const listReviewsHandler = async (_req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await listReviews();
    res.status(200).json(reviews);
  } catch (err) {
    logServerError('listReviewsHandler', err);
    res.status(500).json({ error: "Couldn't load review history. Please try again." });
  }
};

export const listAllowedReposHandler = (_req: Request, res: Response): void => {
  res.status(200).json({ repos: ALLOWED_REPOS });
};
