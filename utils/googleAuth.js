const { google } = require('googleapis');
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
const fs = require('fs');
require('dotenv').config();

async function authorize() {
  const auth = await authenticate({
    keyfilePath: path.join(__dirname, '../credentials.json'),
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/script.projects'
    ],
    redirectUri: process.env.REDIRECT_URI
  });

  const tokens = auth.credentials;
  if (tokens.refresh_token) {
    saveRefreshToken(tokens.refresh_token);
  }

  return auth;
}

function saveRefreshToken(refreshToken) {
  fs.writeFileSync('refresh_token.txt', refreshToken, 'utf8');
}

async function getAuthenticatedClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  if (fs.existsSync('refresh_token.txt')) {
    const refreshToken = fs.readFileSync('refresh_token.txt', 'utf8');
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    await oauth2Client.getAccessToken();
  } else {
    const auth = await authorize();
    oauth2Client.setCredentials(auth.credentials);
  }

  return oauth2Client;
}

module.exports = {
  getAuthenticatedClient,
  authorize
};
