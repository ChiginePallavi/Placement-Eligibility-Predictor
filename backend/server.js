import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5050;

// Start Express server immediately so port 5050 is open and responsive to Vite proxy / health checks
const server = app.listen(PORT, () => {
  console.log(`Backend server running on http://127.0.0.1:${PORT}`);
});

// Asynchronously connect to MongoDB without blocking server listening
connectDB()
  .then(() => {
    console.log('Database initialization complete.');
  })
  .catch((error) => {
    console.error('MongoDB connection attempt failed:', error.message);
  });
