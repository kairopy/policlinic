const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS config
app.use(cors({
  origin: 'http://localhost:5173', // Allow frontend
  credentials: true
}));
app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const TOKENS_PATH = path.join(__dirname, 'tokens.json');

// Helper to save tokens
const saveTokens = (tokens) => {
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2));
};

// Helper to get tokens
const loadTokens = () => {
  if (fs.existsSync(TOKENS_PATH)) {
    return JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
  }
  return null;
};

// Init client with tokens if they exist
const tokens = loadTokens();
if (tokens) {
  oauth2Client.setCredentials(tokens);
}

// 1. Redirect to Google Auth
app.get('/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Crucial to get refresh_token
    prompt: 'consent', // Force consent screen to guarantee a refresh_token
    scope: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/drive.metadata.readonly'
    ]
  });
  res.redirect(url);
});

// 2. Handle Google Callback
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    saveTokens(tokens);
    
    // Redirect back to frontend
    res.redirect('http://localhost:5173/?connected=true');
  } catch (error) {
    console.error('Error retrieving access token', error);
    res.status(500).send('Authentication failed');
  }
});

// 3. Provide Fresh Token to Frontend
app.get('/api/token', async (req, res) => {
  console.log('--- [API HITTED] /api/token requested ---');
  const tokens = loadTokens();
  if (!tokens || !tokens.refresh_token) {
    console.log('No refresh token found in tokens.json');
    return res.status(401).json({ error: 'No refresh token available. User must login.' });
  }

  try {
    // googleapis auto-refreshes the token if it's expired when using getAccessToken()
    const { token } = await oauth2Client.getAccessToken();
    console.log('Successfully provided fresh access token.');
    res.json({ access_token: token });
  } catch (error) {
    console.error('Error refreshing token:', error);
    fs.unlinkSync(TOKENS_PATH); // Clear invalid tokens
    res.status(401).json({ error: 'Failed to refresh token. User must relogin.' });
  }
});

// 4. Logout
app.post('/api/logout', (req, res) => {
  if (fs.existsSync(TOKENS_PATH)) {
    fs.unlinkSync(TOKENS_PATH);
  }
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
