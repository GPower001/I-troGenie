import express from 'express';
import cors from 'cors';
import { fetchAllSymptoms } from './utils/symptomsFetcher.js'; 
import apiRoutes from './routes/api.js'; 
import connectDB from './config/db.js'; 
import { config } from 'dotenv';

config();
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Initialize and fetch symptoms when the server starts
// This ensures allSymptoms is populated before routes are hit
fetchAllSymptoms().then(() => {
    console.log('Symptom list initialized and ready.');
}).catch(error => {
    console.error('Failed to initialize symptom list on startup:', error.message);
    process.exit(1); // Exit if critical initialization fails
});

// Use API routes
// All routes defined in api.js will be mounted under the '/' path
app.use('/', apiRoutes);

// Basic health check for Node.js server
app.get('/', (req, res) => {
    res.send('Node.js Express.js backend is running!');
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
