


import axios from 'axios';
import { fetchAllSymptoms, getSymptoms } from '../utils/symptomsFetcher.js';
import { config } from 'dotenv';

config();

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://192.168.0.2:5000';

const Prediction = async (req, res) => {
    try {
        // Validate input
        const userSymptoms = req.body.symptoms;
        if (!userSymptoms || !Array.isArray(userSymptoms)) {
            return res.status(400).json({ 
                error: 'Invalid or missing "symptoms". Expected an array of symptom strings.' 
            });
        }

        // Get or fetch symptoms list
        let currentSymptomsList = getSymptoms();
        if (currentSymptomsList.length === 0) {
            await fetchAllSymptoms();
            currentSymptomsList = getSymptoms();
            if (currentSymptomsList.length === 0) {
                return res.status(503).json({ 
                    error: 'Symptom data not available. Please try again later.' 
                });
            }
        }

        // Prepare symptoms payload for Flask
        const flaskSymptomsPayload = currentSymptomsList.reduce((acc, symptom) => {
            acc[symptom] = 0; // Initialize all symptoms to 0
            return acc;
        }, {});

        // Mark user symptoms as present (1)
        const unknownSymptoms = [];
        userSymptoms.forEach(symptom => {
            const cleaned = symptom.trim().toLowerCase();
            if (currentSymptomsList.includes(cleaned)) {
                flaskSymptomsPayload[cleaned] = 1;
            } else {
                unknownSymptoms.push(symptom);
            }
        });

        if (unknownSymptoms.length > 0) {
            console.warn(`Unknown symptoms ignored: ${unknownSymptoms.join(', ')}`);
        }

        // Get disease prediction
        const predictionRes = await axios.post(`${FLASK_API_URL}/predict`, {
            symptoms: flaskSymptomsPayload
        }, {
            timeout: 10000 // 10 seconds timeout
        });

        const predictedDisease = predictionRes.data.predicted_disease;
        if (!predictedDisease) {
            throw new Error('No disease prediction returned from API');
        }

        // Get recommendations
        const recRes = await axios.post(`${FLASK_API_URL}/recommendations`, {
            disease: predictedDisease
        }, {
            timeout: 10000 // 10 seconds timeout
        });

        return res.json({
            predicted_disease: predictedDisease,
            recommendations: recRes.data,
            ...(unknownSymptoms.length > 0 && { 
                warnings: {
                    unknown_symptoms: unknownSymptoms 
                }
            })
        });

    } catch (error) {
        console.error('Prediction error:', error.message);
        
        if (axios.isAxiosError(error)) {
            if (error.response) {
                return res.status(error.response.status).json({
                    error: 'Prediction service error',
                    details: error.response.data
                });
            }
            return res.status(504).json({ 
                error: 'Prediction service unavailable',
                details: error.message
            });
        }

        return res.status(500).json({ 
            error: 'Internal server error',
            ...(error.message && { details: error.message })
        });
    }
};

const Symptoms = async (req, res) => {
    try {
        let symptoms = getSymptoms();
        
        if (symptoms.length === 0) {
            console.warn('Symptoms cache empty, fetching from source...');
            await fetchAllSymptoms();
            symptoms = getSymptoms();
        }

        if (symptoms.length === 0) {
            return res.status(503).json({ 
                error: 'Symptom data not available. Please try again later.' 
            });
        }

        return res.json({ symptoms });

    } catch (error) {
        console.error('Symptoms error:', error.message);
        return res.status(503).json({ 
            error: 'Failed to retrieve symptom list',
            ...(error.message && { details: error.message })
        });
    }
};

export { Prediction, Symptoms };
