// utils/symptomFetcher.js

import axios from 'axios'; // Axios is needed here to make HTTP requests
import { config } from 'dotenv';

config();

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://192.168.0.2:5000'; // Your Flask API URL
let allSymptoms = []; // Private variable for this module

// Function to fetch the complete symptom list from the Flask API
export async function fetchAllSymptoms() {
    try {
        console.log(`Attempting to fetch symptom list from Flask API at ${FLASK_API_URL}/get_symptom_list`);
        const response = await axios.get(`${FLASK_API_URL}/get_symptom_list`);
        allSymptoms = response.data.symptoms;
        console.log(`Successfully fetched ${allSymptoms.length} symptoms from Flask.`);
    } catch (error) {
        console.error('Error fetching symptom list from Flask API:', error.message);
        throw error; // Re-throw to be caught by the caller (server.js)
    }
}

// Function to get the fetched symptom list
export function getSymptoms() {
    return allSymptoms;
}
