const { google } = require('googleapis');
const { oauth2Client } = require('../config.cjs');

// Fonction pour envoyer un e-mail
async function sendMail(options) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  
      const message = [
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        'From: xserv.api@gmail.com',
        `To: ${options.to}`,
        `Subject: =?utf-8?B?${Buffer.from(options.subject).toString('base64')}?=`,
        '',
        options.html
      ].join('\r\n');
  
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
  
      console.log('Envoi de l\'e-mail');
      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage
        }
      });
  
      console.log('E-mail envoyé avec succès');
      return result;
    } catch (error) {
      console.error('Erreur détaillée dans sendMail:', JSON.stringify(error, null, 2));
      throw error;
    }
}

module.exports = { sendMail };