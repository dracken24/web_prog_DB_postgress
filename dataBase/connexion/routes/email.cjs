const express = require('express');
const { pool, host } = require('../config.cjs');
const { sendMail } = require('../utils/email.cjs');
const { generateToken } = require('../utils/token.cjs');

const router = express.Router();

router.post('/send-confirmation-email', async (req, res) =>{
	const { email } = req.body;
	const confirmationToken = generateToken();

	try {
		console.log('Mise à jour de la base de données avec le token');
		await pool.query('UPDATE users SET email_verification = $1 WHERE email = $2', [confirmationToken, email]);

		console.log('Envoi de l\'e-mail');
		await sendMail({
			to: email,
			subject: "Confirmation de votre adresse e-mail",
			html: `
				<p>Veuillez confirmer votre adresse e-mail en cliquant sur l'un des liens suivants :</p>
				<p>
					<a href="${host}/api/email/confirm-email?token=${confirmationToken}&action=accept">Accepter</a>
					|
					<a href="${host}/api/email/confirm-email?token=${confirmationToken}&action=reject">Refuser</a>
				</p>
			`
		});

		res.json({ success: true, message: 'E-mail de confirmation envoyé' });
	} catch (error) {
		console.error('Erreur lors de l\'envoi de l\'e-mail de confirmation:', error);
		res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de l\'e-mail de confirmation' });
	}
});

router.get('/confirm-email', async (req, res) => {
		const { token, action } = req.query;
		
		try {
				if (action === 'accept') {
				await pool.query('UPDATE users SET email_verification = true WHERE email_verification = $1', [token]);
				res.send('Votre adresse e-mail a été confirmée avec succès.');
				} else {
				await pool.query('DELETE FROM users WHERE email_verification = $1', [token]);
				res.send('Votre inscription a été annulée.');
				}
		} catch (error) {
				console.error('Erreur lors de la confirmation de l\'e-mail:', error);
				res.status(500).send('Une erreur est survenue lors de la confirmation de l\'e-mail.');
		}
});

router.post('/resend-verification-email', async (req, res) => {
		const { email } = req.body;
		const confirmationToken = generateToken();
		
		try {
				await pool.query('UPDATE users SET email_verification = $1 WHERE email = $2', [confirmationToken, email]);
		
				await sendMail({
				to: email,
				subject: "Confirmation de votre adresse e-mail",
				html: `
						<p>Veuillez confirmer votre adresse e-mail en cliquant sur l'un des liens suivants :</p>
						<p>
						<a href="${host}/api/email/confirm-email?token=${confirmationToken}&action=accept">Accepter</a>
						|
						<a href="${host}/api/email/confirm-email?token=${confirmationToken}&action=reject">Refuser</a>
						</p>
				`
				});
		
				res.json({ success: true, message: 'E-mail de vérification renvoyé' });
		} catch (error) {
				console.error('Erreur lors du renvoi de l\'e-mail de vérification:', error);
				res.status(500).json({ success: false, message: 'Erreur lors du renvoi de l\'e-mail de vérification' });
		}
});

module.exports = router;
