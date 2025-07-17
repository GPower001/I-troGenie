import axios from 'axios';
import { getSymptoms } from '../utils/symptomsFetcher.js';

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://192.168.0.2:5000';

class FlaskService {
    static async getPrediction(userSymptoms) {
        const symptomsList = getSymptoms();
        if (symptomsList.length === 0) {
            throw new Error('Symptom list not initialized');
        }

        const payload = this.prepareSymptomsPayload(userSymptoms, symptomsList);
        const response = await axios.post(`${FLASK_API_URL}/predict`, {
            symptoms: payload
        }, { timeout: 10000 });

        return response.data;
    }

    static async getRecommendations(disease) {
        const response = await axios.post(`${FLASK_API_URL}/recommendations`, {
            disease
        }, { timeout: 10000 });
        return response.data;
    }

    static prepareSymptomsPayload(userSymptoms, symptomsList) {
        const payload = symptomsList.reduce((acc, symptom) => {
            acc[symptom] = 0;
            return acc;
        }, {});

        const unknownSymptoms = [];
        
        userSymptoms.forEach(symptom => {
            const cleaned = symptom.trim().toLowerCase();
            if (symptomsList.includes(cleaned)) {
                payload[cleaned] = 1;
            } else {
                unknownSymptoms.push(symptom);
            }
        });

        return {
            payload,
            unknownSymptoms
        };
    }
}

export default FlaskService;