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
import loginRoutes from './routes/login.js';
app.use('/api/login', loginRoutes);

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