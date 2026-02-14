import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: "./config/config.env" });

const app = express();

// Global middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// Routes
import audioRoutes from './routes/audioRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';

app.use('/api/audio', audioRoutes);
app.use('/api/playlist', playlistRoutes);

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