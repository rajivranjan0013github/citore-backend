import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: "./config/config.env" });

const app = express();

// Global middleware
app.use(cors());

app.use(express.json());

// Routes
import audioRoutes from './routes/audioRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import loginRoutes from './routes/login.js';
import userRoutes from './routes/userRoutes.js';
import playHistoryRoutes from './routes/playHistoryRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

app.use('/api/login', loginRoutes);
app.use('/api/users', userRoutes);
app.use('/api/webhooks', webhookRoutes);

app.use('/api/audio', audioRoutes);
app.use('/api/playlist', playlistRoutes);
app.use('/api/play-history', playHistoryRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

// Routes


// Connect to MongoDB and start scheduler
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    // Start Agenda scheduler after MongoDB is ready
    console.log('connected to mongodb');

  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});