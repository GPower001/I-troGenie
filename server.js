// server.js
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

// Initialize symptoms
fetchAllSymptoms().then(() => {
    console.log('✅ Symptom list ready');
}).catch(error => {
    console.error('❌ Symptom init failed:', error.message);
    process.exit(1);
});

// API Routes
app.use('/api', apiRoutes);

// Simple root endpoint
app.get('/', (req, res) => {
    res.send('Disease Prediction API');
});

// Error handling
app.use((err, req, res, next) => {
    console.error('⚠️ Server error:', err.message);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// import express from 'express';
// import cors from 'cors';
// import { fetchAllSymptoms } from './utils/symptomsFetcher.js'; 
// import apiRoutes from './routes/api.js';
// import recommendationRoutes from './routes/recommendation.route.js';
// import connectDB from './config/db.js'; 
// import { config } from 'dotenv';

// config();
// const app = express();
// const PORT = process.env.PORT || 3000;

// // Connect to MongoDB
// connectDB();

// // Middleware
// app.use(cors()); 
// app.use(express.json()); 

// // Initialize symptoms data
// fetchAllSymptoms().then(() => {
//     console.log('✅ Symptom list initialized and ready');
// }).catch(error => {
//     console.error('❌ Failed to initialize symptom list:', error.message);
//     process.exit(1);
// });

// // API Routes
// app.use('/api', apiRoutes); // Main API routes under /api
// app.use('/api/recommendations', recommendationRoutes); // Recommendation routes

// // Simple root endpoint
// app.get('/', (req, res) => {
//     res.send('Disease Prediction API Service');
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error('⚠️ Server error:', err.message);
//     res.status(500).json({ 
//         error: 'Internal server error',
//         message: err.message 
//     });
// });

// // Start server
// app.listen(PORT, () => {
//     console.log(`🚀 Server running on http://localhost:${PORT}`);
//     console.log('📌 Available endpoints:');
//     console.log(`- http://localhost:${PORT}/api/predict`);
//     console.log(`- http://localhost:${PORT}/api/symptoms`);
//     console.log(`- http://localhost:${PORT}/api/recommendations`);
// });