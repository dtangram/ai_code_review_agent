import { pool } from '../../config/db';
import type { ReviewComment, ReviewRecord, ReviewRequest } from '../../types/review.types';

const mapRow = ({
  id,
  repo_owner: repoOwner,
  repo_name: repoName,
  pull_number: pullNumber,
  pr_title: prTitle,
  status,
  comments,
  created_at: createdAt,
}: {
  id: string;
  repo_owner: string;
  repo_name: string;
  pull_number: number;
  pr_title: string | null;
  status: ReviewRecord['status'];
  comments: ReviewComment[];
  created_at: string;
}): ReviewRecord => ({
  id,
  repoOwner,
  repoName,
  pullNumber,
  prTitle,
  status,
  comments,
  createdAt,
});

export const createReview = async (
  request: ReviewRequest,
  prTitle: string | null
): Promise<ReviewRecord> => {
  const { repoOwner, repoName, pullNumber } = request;
  const { rows } = await pool.query(
    `INSERT INTO reviews (repo_owner, repo_name, pull_number, pr_title, status)
     VALUES ($1, $2, $3, $4, 'running')
     RETURNING *`,
    [repoOwner, repoName, pullNumber, prTitle]
  );
  const [row] = rows;
  return mapRow(row);
};

export const completeReview = async (
  id: string,
  comments: ReviewComment[]
): Promise<void> => {
  await pool.query(
    `UPDATE reviews SET status = 'completed', comments = $2 WHERE id = $1`,
    [id, JSON.stringify(comments)]
  );
};

export const failReview = async (id: string): Promise<void> => {
  await pool.query(`UPDATE reviews SET status = 'failed' WHERE id = $1`, [id]);
};

export const getReviewById = async (id: string): Promise<ReviewRecord | null> => {
  const { rows } = await pool.query(`SELECT * FROM reviews WHERE id = $1`, [id]);
  const [row] = rows;
  return row ? mapRow(row) : null;
};

export const listReviews = async (limit = 20): Promise<ReviewRecord[]> => {
  const { rows } = await pool.query(
    `SELECT * FROM reviews ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return rows.map(mapRow);
};
