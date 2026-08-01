import 'dotenv/config';
import path from 'path';
import cors from 'cors';
import express from 'express';
import reviewRouter from './routes/review.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/reviews', reviewRouter);

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// In production (Heroku), Express serves the React build directly instead of
// a separate static host — one dyno, one app. This is a no-op in local dev,
// where the Vite dev server (port 5173) serves the frontend instead.
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../react/dist');
  app.use(express.static(clientDist));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.log(`AI Code Review Agent server listening on port ${PORT}`);
});
