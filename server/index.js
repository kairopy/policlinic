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

// Determine a persistent storage path for tokens
const getTokensPath = () => {
  const dataDir = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + '/.config');
  const policlinicDir = path.join(dataDir, 'policlinic-server');
  
  if (!fs.existsSync(policlinicDir)) {
    fs.mkdirSync(policlinicDir, { recursive: true });
  }
  
  return path.join(policlinicDir, 'tokens.json');
};

const TOKENS_PATH = getTokensPath();
console.log('Using persistent tokens storage at:', TOKENS_PATH);

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
    
    // Instead of redirecting to the web app (which opens the dashboard in the browser),
    // show a BRANDED success message so the user can go back to the Desktop app.
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vinculación Exitosa | Policlinic</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
          <style>
            :root {
              --color-primary: #3b82f6;
              --color-primary-dark: #2563eb;
              --color-bg: #030712;
              --color-surface: #111827;
              --color-text: #f3f4f6;
            }
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              background-color: var(--color-bg);
              color: var(--color-text);
              overflow: hidden;
            }
            .glass-card {
              background: rgba(17, 24, 39, 0.7);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.1);
              padding: 4rem 3rem;
              border-radius: 32px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
              text-align: center;
              max-width: 480px;
              width: 90%;
              animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .icon-circle {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, var(--color-primary), #10b981);
              border-radius: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 2.5rem;
              box-shadow: 0 15px 30px -5px rgba(59, 130, 246, 0.4);
            }
            h1 { font-size: 2.25rem; font-weight: 800; margin: 0 0 1rem; letter-spacing: -0.025em; }
            p { font-size: 1.125rem; color: #9ca3af; line-height: 1.6; margin-bottom: 3rem; }
            .btn {
              background-color: var(--color-primary);
              color: white;
              padding: 1rem 2rem;
              border-radius: 16px;
              font-weight: 700;
              font-size: 1.125rem;
              text-decoration: none;
              transition: all 0.3s ease;
              border: none;
              cursor: pointer;
              display: inline-block;
              width: 100%;
              box-sizing: border-box;
            }
            .btn:hover { background-color: var(--color-primary-dark); transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.5); }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(40px); }
              to { opacity: 1; transform: translateY(0); }
            }
          </style>
        </head>
        <body>
          <div class="glass-card">
            <div class="icon-circle">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h1>¡Excelente!</h1>
            <p>La vinculación se completó correctamente. Ya puedes regresar a tu aplicación de escritorio <b>Policlinic</b>.</p>
            <button onclick="window.close()" class="btn">Continuar en la App</button>
            <p style="margin-top: 1.5rem; font-size: 0.85rem; color: #6b7280; margin-bottom: 0;">(Ya puedes cerrar esta pestaña manualmente)</p>
          </div>
          <script>
            // Note: window.close() only works if the window was opened via script.
            // In many browsers it will be blocked, so we provide fallback info.
            setTimeout(() => {
              const btn = document.querySelector('.btn');
              if (btn) btn.innerHTML = 'Listo para cerrar';
            }, 3000);
          </script>
        </body>
      </html>
    `);
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

const startServer = () => {
  return app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
};

// Start automatically if run directly, otherwise export for Electron
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
