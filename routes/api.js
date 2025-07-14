// routes/api.js

import { Router } from 'express';
import axios from 'axios'; // Axios is needed here to make HTTP requests to Flask
import { getSymptoms, fetchAllSymptoms } from '../utils/symptomsFetcher.js'; // Import the symptom fetcher utility

const router = Router(); // Create an Express Router
const FLASK_API_URL = process.env.FLASK_API_URL || 'http://192.168.0.2:5000'; // Your Flask API URL

// Endpoint to predict disease
// This endpoint expects a simple array of symptom strings from the frontend
router.post('/predict', async (req, res) => {
    const userSymptoms = req.body.symptoms; // e.g., ["shivering", "headache", "pain"]

    if (!userSymptoms || !Array.isArray(userSymptoms)) {
        return res.status(400).json({ error: 'Invalid or missing "symptoms" in request body. Expected an array of strings.' });
    }

    let currentSymptomsList = getSymptoms(); // Get the current symptom list

    // If symptom list is not yet loaded or is empty, try to re-fetch it
    if (currentSymptomsList.length === 0) {
        console.error('Symptom list not loaded yet in API routes. Attempting to re-fetch.');
        try {
            await fetchAllSymptoms(); // Try re-fetching
            currentSymptomsList = getSymptoms(); // Update list after re-fetch
            if (currentSymptomsList.length === 0) {
                return res.status(503).json({ error: 'Symptom list not available after retry. Please try again in a moment.' });
            }
        } catch (error) {
            console.error('Failed to re-fetch symptom list in API routes:', error.message);
            return res.status(503).json({ error: 'Symptom list not available due to re-fetch failure.' });
        }
    }

    // Transform user-provided symptoms into the 132-feature vector for Flask API
    const flaskSymptomsPayload = {};
    currentSymptomsList.forEach(symptom => {
        // Initialize all 132 symptoms to 0
        flaskSymptomsPayload[symptom] = 0;
    });

    userSymptoms.forEach(symptom => {
        const cleanedSymptom = symptom.trim().toLowerCase(); // Clean user input
        // Check if the cleaned symptom exists in our master list
        if (currentSymptomsList.includes(cleanedSymptom)) {
            flaskSymptomsPayload[cleanedSymptom] = 1; // Set to 1 if user has this symptom
        } else {
            console.warn(`User provided unknown symptom: "${symptom}". It will be ignored.`);
            // You might want to return an error or a list of unrecognized symptoms to the user
        }
    });

    try {
        console.log('Sending prediction request to Flask API...');
        const flaskResponse = await axios.post(`${FLASK_API_URL}/predict`, {
            symptoms: flaskSymptomsPayload
        });
        res.json(flaskResponse.data); // Send Flask's response back to the frontend
    } catch (error) {
        console.error('Error calling Flask /predict API:', error.message);
        if (error.response) {
            console.error('Flask API Error Response:', error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to connect to Flask API for prediction.' });
        }
    }
});

// Endpoint to get recommendations
router.post('/recommendations', async (req, res) => {
    const diseaseName = req.body.disease;

    if (!diseaseName || typeof diseaseName !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing "disease" in request body. Expected a string.' });
    }

    try {
        console.log(`Sending recommendations request to Flask API for disease: ${diseaseName}`);
        const flaskResponse = await axios.post(`${FLASK_API_URL}/recommendations`, {
            disease: diseaseName
        });
        res.json(flaskResponse.data); // Send Flask's response back to the frontend
    } catch (error) {
        console.error('Error calling Flask /recommendations API:', error.message);
        if (error.response) {
            console.error('Flask API Error Response:', error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to connect to Flask API for recommendations.' });
        }
    }
});

// New Endpoint: To expose the full symptom list to the frontend
router.get('/symptoms', (req, res) => {
    const symptoms = getSymptoms();
    if (symptoms.length === 0) {
        // If the list is not yet loaded, try to re-fetch it (though it should be loaded on server startup)
        console.warn('Frontend requested symptom list, but it is empty. Attempting re-fetch.');
        fetchAllSymptoms().then(() => {
            const reFetchedSymptoms = getSymptoms();
            if (reFetchedSymptoms.length > 0) {
                res.json({ symptoms: reFetchedSymptoms });
            } else {
                res.status(503).json({ error: 'Symptom list not yet loaded or available.' });
            }
        }).catch(error => {
            console.error('Error re-fetching symptom list for frontend:', error.message);
            res.status(503).json({ error: 'Failed to retrieve symptom list.' });
        });
    } else {
        res.json({ symptoms: symptoms });
    }
});


export default router; // Export the router
