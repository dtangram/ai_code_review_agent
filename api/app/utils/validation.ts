import { z } from 'zod';

export const reviewRequestSchema = z.object({
  repoOwner: z.string().min(1, 'repoOwner is required'),
  repoName: z.string().min(1, 'repoName is required'),
  pullNumber: z.coerce.number().int().positive('pullNumber must be a positive integer'),
});

export const reviewIdParamSchema = z.object({
  id: z.string().uuid('id must be a valid UUID'),
});

export const publishReviewSchema = z.object({
  comments: z
    .array(
      z.object({
        filePath: z.string().min(1),
        line: z.number().int().positive().nullable(),
        body: z.string().min(1),
      })
    )
    .min(1, 'At least one accepted comment is required to publish'),
});

export const validateReviewRequest = (payload: unknown) => reviewRequestSchema.safeParse(payload);

export const validateReviewIdParam = (payload: unknown) => reviewIdParamSchema.safeParse(payload);

export const validatePublishReview = (payload: unknown) => publishReviewSchema.safeParse(payload);
