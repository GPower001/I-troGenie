import axios from 'axios';
import { config } from 'dotenv';
import cache from 'memory-cache';

config();

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://192.168.0.2:5000';
const CACHE_KEY = 'symptoms_list';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchAllSymptoms() {
    try {
        const cached = cache.get(CACHE_KEY);
        if (cached) return cached;

        console.log(`Fetching symptom list from ${FLASK_API_URL}/get_symptom_list`);
        const response = await axios.get(`${FLASK_API_URL}/get_symptom_list`, {
            timeout: 5000
        });

        if (!response.data?.symptoms) {
            throw new Error('Invalid symptom list format');
        }

        cache.put(CACHE_KEY, response.data.symptoms, CACHE_DURATION);
        return response.data.symptoms;
    } catch (error) {
        console.error('Symptom fetch error:', error.message);
        throw error;
    }
}

export function getSymptoms() {
    return cache.get(CACHE_KEY) || [];
}

export async function initializeSymptoms() {
    try {
        const symptoms = getSymptoms();
        if (symptoms.length === 0) {
            await fetchAllSymptoms();
        }
    } catch (error) {
        console.error('Failed to initialize symptoms:', error.message);
    }
}





// // utils/symptomFetcher.js

// import axios from 'axios'; // Axios is needed here to make HTTP requests
// import { config } from 'dotenv';

// config();

// const FLASK_API_URL = process.env.FLASK_API_URL || 'http://192.168.0.2:5000'; // Your Flask API URL
// let allSymptoms = []; // Private variable for this module

// // Function to fetch the complete symptom list from the Flask API
// export async function fetchAllSymptoms() {
//     try {
//         console.log(`Attempting to fetch symptom list from Flask API at ${FLASK_API_URL}/get_symptom_list`);
//         const response = await axios.get(`${FLASK_API_URL}/get_symptom_list`);
//         allSymptoms = response.data.symptoms;
//         console.log(`Successfully fetched ${allSymptoms.length} symptoms from Flask.`);
//     } catch (error) {
//         console.error('Error fetching symptom list from Flask API:', error.message);
//         throw error; // Re-throw to be caught by the caller (server.js)
//     }
// }

// // Function to get the fetched symptom list
// export function getSymptoms() {
//     return allSymptoms;
// }
