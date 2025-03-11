const { Pool } = require('pg');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const path = require('path');

// Configuration de la base de données
const pool = new Pool({
  user: 'connector',
  host: 'localhost',
  database: 'xusers',
  password: 'Banane24',
  port: 5432,
});

// Configuration OAuth2
// const CLIENT_ID = '380982231662-qcf430ah2jamigjt0tv0bk182obvqb6v.apps.googleusercontent.com';
// const CLIENT_SECRET = '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';
// const REDIRECT_URI = 'http://localhost:3001';
// const REFRESH_TOKEN = "1//01qBQVIlZu-RuCgYIARAAGAESNwF-L9IrafiZFyN7wuZcKf2NEXH9_7attNmy7nuxDt4V1neNoexKn_XtBrH05LKNpn0nDiuSfxg";
// const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

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
