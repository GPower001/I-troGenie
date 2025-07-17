// // // routes/api.js

// // import { Router } from 'express';
// // import axios from 'axios'; // Axios is needed here to make HTTP requests to Flask
// // import { getSymptoms, fetchAllSymptoms } from '../utils/symptomsFetcher.js'; // Import the symptom fetcher utility

// // const router = Router(); // Create an Express Router
// // const FLASK_API_URL = process.env.FLASK_API_URL || 'http://192.168.0.2:5000'; // Your Flask API URL

// // // Endpoint to predict disease
// // // This endpoint expects a simple array of symptom strings from the frontend
// // router.post('/predict', async (req, res) => {
// //     const userSymptoms = req.body.symptoms; // e.g., ["shivering", "headache", "pain"]

// //     if (!userSymptoms || !Array.isArray(userSymptoms)) {
// //         return res.status(400).json({ error: 'Invalid or missing "symptoms" in request body. Expected an array of strings.' });
// //     }

// //     let currentSymptomsList = getSymptoms(); // Get the current symptom list

// //     // If symptom list is not yet loaded or is empty, try to re-fetch it
// //     if (currentSymptomsList.length === 0) {
// //         console.error('Symptom list not loaded yet in API routes. Attempting to re-fetch.');
// //         try {
// //             await fetchAllSymptoms(); // Try re-fetching
// //             currentSymptomsList = getSymptoms(); // Update list after re-fetch
// //             if (currentSymptomsList.length === 0) {
// //                 return res.status(503).json({ error: 'Symptom list not available after retry. Please try again in a moment.' });
// //             }
// //         } catch (error) {
// //             console.error('Failed to re-fetch symptom list in API routes:', error.message);
// //             return res.status(503).json({ error: 'Symptom list not available due to re-fetch failure.' });
// //         }
// //     }

// //     // Transform user-provided symptoms into the 132-feature vector for Flask API
// //     const flaskSymptomsPayload = {};
// //     currentSymptomsList.forEach(symptom => {
// //         // Initialize all 132 symptoms to 0
// //         flaskSymptomsPayload[symptom] = 0;
// //     });

// //     userSymptoms.forEach(symptom => {
// //         const cleanedSymptom = symptom.trim().toLowerCase(); // Clean user input
// //         // Check if the cleaned symptom exists in our master list
// //         if (currentSymptomsList.includes(cleanedSymptom)) {
// //             flaskSymptomsPayload[cleanedSymptom] = 1; // Set to 1 if user has this symptom
// //         } else {
// //             console.warn(`User provided unknown symptom: "${symptom}". It will be ignored.`);
// //             // You might want to return an error or a list of unrecognized symptoms to the user
// //         }
// //     });

// //     try {
// //         console.log('Sending prediction request to Flask API...');
// //         const flaskResponse = await axios.post(`${FLASK_API_URL}/predict`, {
// //             symptoms: flaskSymptomsPayload
// //         });
// //         res.json(flaskResponse.data); // Send Flask's response back to the frontend
// //     } catch (error) {
// //         console.error('Error calling Flask /predict API:', error.message);
// //         if (error.response) {
// //             console.error('Flask API Error Response:', error.response.data);
// //             res.status(error.response.status).json(error.response.data);
// //         } else {
// //             res.status(500).json({ error: 'Failed to connect to Flask API for prediction.' });
// //         }
// //     }
// // });

// // // Endpoint to get recommendations
// // router.post('/recommendations', async (req, res) => {
// //     const diseaseName = req.body.disease;

// //     if (!diseaseName || typeof diseaseName !== 'string') {
// //         return res.status(400).json({ error: 'Invalid or missing "disease" in request body. Expected a string.' });
// //     }

// //     try {
// //         console.log(`Sending recommendations request to Flask API for disease: ${diseaseName}`);
// //         const flaskResponse = await axios.post(`${FLASK_API_URL}/recommendations`, {
// //             disease: diseaseName
// //         });
// //         res.json(flaskResponse.data); // Send Flask's response back to the frontend
// //     } catch (error) {
// //         console.error('Error calling Flask /recommendations API:', error.message);
// //         if (error.response) {
// //             console.error('Flask API Error Response:', error.response.data);
// //             res.status(error.response.status).json(error.response.data);
// //         } else {
// //             res.status(500).json({ error: 'Failed to connect to Flask API for recommendations.' });
// //         }
// //     }
// // });

// // // New Endpoint: To expose the full symptom list to the frontend
// // router.get('/symptoms', (req, res) => {
// //     const symptoms = getSymptoms();
// //     if (symptoms.length === 0) {
// //         // If the list is not yet loaded, try to re-fetch it (though it should be loaded on server startup)
// //         console.warn('Frontend requested symptom list, but it is empty. Attempting re-fetch.');
// //         fetchAllSymptoms().then(() => {
// //             const reFetchedSymptoms = getSymptoms();
// //             if (reFetchedSymptoms.length > 0) {
// //                 res.json({ symptoms: reFetchedSymptoms });
// //             } else {
// //                 res.status(503).json({ error: 'Symptom list not yet loaded or available.' });
// //             }
// //         }).catch(error => {
// //             console.error('Error re-fetching symptom list for frontend:', error.message);
// //             res.status(503).json({ error: 'Failed to retrieve symptom list.' });
// //         });
// //     } else {
// //         res.json({ symptoms: symptoms });
// //     }
// // });


// // export default router; // Export the router


// // routes/api.js

// import { Router } from 'express'; 
// import { Prediction, Symptoms } from '../controllers/prediction.controller.js';

// const router = Router(); // Create an Express Router
// router.post('/predict', Prediction);
// router.get('/symptoms', Symptoms);

// export default router; 

// routes/api.js
// import { Router } from 'express';
// import axios from 'axios';
// import { getSymptoms, fetchAllSymptoms } from '../utils/symptomsFetcher.js';

// const router = Router();
// const FLASK_API_URL = process.env.FLASK_API_URL || 'http://192.168.0.2:5000';

// router.post('/predict', async (req, res) => {
//     try {
//         const userSymptoms = req.body.symptoms;
        
//         if (!userSymptoms || !Array.isArray(userSymptoms)) {
//             return res.status(400).json({ 
//                 error: 'Invalid or missing symptoms array' 
//             });
//         }

//         // Get symptoms list
//         let symptomsList = getSymptoms();
//         if (symptomsList.length === 0) {
//             await fetchAllSymptoms();
//             symptomsList = getSymptoms();
//             if (symptomsList.length === 0) {
//                 return res.status(503).json({ 
//                     error: 'Symptom data not available' 
//                 });
//             }
//         }

//         // Prepare payload for prediction
//         const symptomsPayload = symptomsList.reduce((acc, symptom) => {
//             acc[symptom] = 0;
//             return acc;
//         }, {});

//         const unknownSymptoms = [];
//         userSymptoms.forEach(symptom => {
//             const cleaned = symptom.trim().toLowerCase();
//             if (symptomsList.includes(cleaned)) {
//                 symptomsPayload[cleaned] = 1;
//             } else {
//                 unknownSymptoms.push(symptom);
//             }
//         });

//         // Get prediction from Flask API
//         const predictionRes = await axios.post(`${FLASK_API_URL}/predict`, {
//             symptoms: symptomsPayload
//         }, { timeout: 10000 });

//         const predictedDisease = predictionRes.data.predicted_disease;
//         if (!predictedDisease) {
//             throw new Error('No disease prediction returned');
//         }

//         // Get recommendations from Flask API
//         const recommendationsRes = await axios.post(`${FLASK_API_URL}/recommendations`, {
//             disease: predictedDisease
//         }, { timeout: 10000 });

//         // Combine results
//         const response = {
//             predicted_disease: predictedDisease,
//             recommendations: recommendationsRes.data,
//             ...(unknownSymptoms.length > 0 && {
//                 warnings: {
//                     unknown_symptoms: unknownSymptoms
//                 }
//             })
//         };

//         res.json(response);

//     } catch (error) {
//         console.error('Prediction error:', error.message);
//         if (error.response) {
//             res.status(error.response.status).json(error.response.data);
//         } else {
//             res.status(500).json({ 
//                 error: 'Prediction service error',
//                 details: error.message 
//             });
//         }
//     }
// });

// // Keep your existing symptoms endpoint
// router.get('/symptoms', (req, res) => {
//     const symptoms = getSymptoms();
//     if (symptoms.length === 0) {
//         return res.status(503).json({ 
//             error: 'Symptom list not available' 
//         });
//     }
//     res.json({ symptoms });
// });

// export default router;



import { Router } from 'express';
import predictionController from '../controllers/prediction.controller.js';
import authMiddleware from '../middlewares/authmiddleware.js';

const router = Router();

router.post('/predict', authMiddleware, predictionController.predict);
router.get('/history', authMiddleware, predictionController.getHistory);
router.get('/symptoms', predictionController.getSymptoms);

export default router;