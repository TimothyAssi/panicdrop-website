#!/usr/bin/env node

// Netlify build script to inject environment variables into JavaScript
const fs = require('fs');
const path = require('path');

console.log('🔧 Injecting environment variables...');

// Read the Firebase config file
const configPath = path.join(__dirname, 'js', 'firebase-config-real.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Replace the placeholder with the actual environment variable
const firebaseApiKey = process.env.FIREBASE_API_KEY;

if (firebaseApiKey) {
    // Create a script tag that sets the global variable
    const envScript = `
// Environment variables injected at build time
window.FIREBASE_API_KEY = "${firebaseApiKey}";
`;
    
    // Insert at the beginning of the file
    configContent = envScript + configContent;
    
    // Write back to file
    fs.writeFileSync(configPath, configContent);
    
    console.log('✅ Firebase API key injected successfully');
} else {
    console.warn('⚠️ FIREBASE_API_KEY environment variable not found');
}

console.log('🚀 Build script completed');