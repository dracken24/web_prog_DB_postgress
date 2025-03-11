const { Pool } = require('pg');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const path = require('path');

// Configuration de la base de données


// Configuration OAuth2


const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN,
  scope: SCOPES.join(' ')
});

// Autres configurations
const JWT_SECRET = 'votre_clé_secrète_très_longue_et_complexe';
const host = 'http://localhost:3001';

// Ajoutez cette ligne pour définir le chemin absolu vers le dossier 'uploads'
const uploadsPath = path.join(__dirname, '../../uploads');

module.exports = {
  pool,
  oauth2Client,
  JWT_SECRET,
  host,
  uploadsPath
};
