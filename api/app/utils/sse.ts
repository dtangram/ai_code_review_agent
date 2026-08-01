import type { Response } from 'express';
import type { AgentEvent } from '../types/review.types';

export const initSse = (res: Response): void => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
};

export const sendSseEvent = (res: Response, event: AgentEvent): void => {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
};

export const closeSse = (res: Response): void => {
  res.end();
};
