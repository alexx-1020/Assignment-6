import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import recipesRouter from './routes/recipes.js';

const dbUri = process.env.MONGODB_URI;
const port = Number(process.env.PORT) || 3000;

function logger(req, res, next) {
  const time = new Date().toLocaleTimeString();
  console.log(`${time} ${req.method} ${req.path}`);
  next();
}

function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

function handleErrors(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large (limit: 100 KB)' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

const app = express();
app.use(logger);
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok' }));
app.use('/api/recipes', recipesRouter);

app.use(notFound);
app.use(handleErrors);

if (!dbUri) {
  console.error('MONGODB_URI is not set. Copy .env.example to .env and put your connection string in it.');
  process.exit(1);
}

try {
  await mongoose.connect(dbUri);
  console.log('connected to MongoDB');
  app.listen(port, err => {
    if (err) {
      console.error(`Could not listen on port ${port}: ${err.message}`);
      process.exit(1);
    }
    console.log(`Recipes API listening on http://localhost:${port}`);
  });
} catch (err) {
  console.error('DB connection failed:', err.message);
  process.exit(1);
}
