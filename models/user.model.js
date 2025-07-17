import mongoose from "mongoose";

const predictionHistorySchema = new mongoose.Schema({
    disease: { type: String, required: true },
    predictionDate: { type: Date, default: Date.now },
    symptoms: [String], 
    confidence: Number,
    additionalInfo: Object
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tokens: [{
        token: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: '30d' // Auto-delete after 30 days
        }
    }],
    createdAt: { type: Date, default: Date.now },
    predictionHistory: [predictionHistorySchema] // Array of prediction history
});

const User = mongoose.model("User", userSchema);

export default User;


userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};