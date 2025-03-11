const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool, JWT_SECRET } = require('../config.cjs');

const router = express.Router();

router.post('/login', async (req, res) => {
    const { user_name, password } = req.body;
    try {
        if (!user_name) {
            return res.status(400).json({ success: false, message: 'Nom d\'utilisateur requis' });
        }

        const query = `
            SELECT u.*, p.url AS photo_url
            FROM users u
            LEFT JOIN photo_collections pc ON u.photo_collection_id = pc.id
            LEFT JOIN photos p ON pc.id = p.collection_id AND p.type_id = (SELECT id FROM photo_types WHERE name = 'profile' AND p.is_active = TRUE)
            WHERE u.user_name = $1
        `;
        const params = [user_name];

        console.log('Recherche utilisateur avec:', user_name);
        console.log('Requête SQL:', query);
        console.log('Paramètres:', params);
        
        const result = await pool.query(query, params);
        console.log('Résultat de la requête:', result.rows);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            user.user_name = user.user_name.trim();
            user.password = user.password.trim();
            user.email = user.email.trim();
            user.email_verification = user.email_verification.trim();
            console.log('user Trimmed');
            console.log(user);
            const isValid = await bcrypt.compare(password, user.password);
            if (isValid) {
                if (user.email_verification === 'true') {
                    console.log('Connexion réussie');
                    
                    // Créer un token JWT
                    const token = jwt.sign(
                        { user_id: user.id, user_name: user.user_name },
                        JWT_SECRET,
                        { expiresIn: '30d' } // Le token expire après 30 jours
                    );

                    res.json({ 
                        success: true, 
                        message: 'Connexion réussie', 
                        user_name: user.user_name,
                        email: user.email,
                        userId: user.id,
                        token: token,
                        photo_url: user.photo_url
                    });
                } else {
                    console.log('E-mail non vérifié');
                    res.json({ success: false, message: 'E-mail non vérifié', needVerification: true, email: user.email });
                }
            } else {
                console.log('Nom d\'utilisateur ou mot de passe incorrect');
                res.status(401).json({ success: false, message: 'Nom d\'utilisateur ou mot de passe incorrect' });
            }
        } else {
            console.log('Nom d\'utilisateur ou mot de passe incorrect');
            res.status(401).json({ success: false, message: 'Nom d\'utilisateur ou mot de passe incorrect' });
        }
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
});

router.post('/signup', async (req, res) => {
    const { user_name, email, password } = req.body;
    try
    {
        // Vérifiez si l'email existe déjà
        const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0)
        {
            return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });
        }

        // Vérifiez si le nom d'utilisateur existe déjà
        const userNameCheck = await pool.query('SELECT * FROM users WHERE user_name = $1', [user_name]);
        if (userNameCheck.rows.length > 0)
        {
            return res.status(400).json({ success: false, message: 'Ce nom d\'utilisateur est déjà utilisé' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        // console.log(hashedPassword);
        const result = await pool.query(
            'INSERT INTO users (user_name, email, password, email_verification) VALUES ($1, $2, $3, $4) RETURNING user_name',
            [user_name, email, hashedPassword, false]
        );
        res.json({ success: true, message: 'Inscription réussie', userId: result.rows[0].user_name });
    }
    catch (error)
    {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
});

router.post('/verify-token', (req, res) => {
    const token = req.body.token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Aucun token fourni' });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({ success: true, user: decoded });
    } catch (error) {
      res.status(401).json({ success: false, message: 'Token invalide' });
    }
});

module.exports = router;
