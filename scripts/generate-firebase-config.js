#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file if it exists
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    envLines.forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

// Get the Firebase API key from environment variables
const firebaseApiKey = process.env.FIREBASE_API_KEY;

if (!firebaseApiKey) {
    console.error('❌ Error: FIREBASE_API_KEY not found in environment variables');
    console.error('Please create a .env file with FIREBASE_API_KEY=your_api_key');
    process.exit(1);
}

// Generate the firebase-config-env.js file
const configContent = `// Firebase Environment Configuration
// This file is auto-generated from environment variables
// Do not edit manually - run 'npm run generate-firebase-config' instead

export const firebaseEnvConfig = {
    apiKey: "${firebaseApiKey}",
    // Other config values are loaded from firebase-config-real.js
};
`;

const outputPath = path.join(__dirname, '..', 'js', 'firebase-config-env.js');
fs.writeFileSync(outputPath, configContent);

console.log('✅ Firebase configuration generated successfully from environment variables');
console.log(`📝 File written to: ${outputPath}`);
console.log(`🔑 API Key: ${firebaseApiKey.substring(0, 10)}...`);