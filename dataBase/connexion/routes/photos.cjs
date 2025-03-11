const express = require('express');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const { pool, uploadsPath } = require('../config.cjs');
const Profil = require('../models/profil.cjs');
// const multer = require('multer');
// const path = require('path');
// const crypto = require('crypto');

const router = express.Router();

// const fs = require('fs');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');

// Configuration de multer pour le téléchargement de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Utilisez un répertoire temporaire
    const tempDir = path.join(__dirname, '../../uploads/temp');
    fs.ensureDirSync(tempDir);
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// Gestionnaire de route pour le téléchargement de photo
router.post('/update-photo', upload.single('photo'), async (req, res) => {
    try {
      const userId = req.body.userId;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'ID utilisateur manquant.' });
      }
  
      const tempPath = req.file.path;
      const targetDir = path.join(__dirname, '../../uploads', userId);
      const targetPath = path.join(targetDir, req.file.originalname);
  
      console.log('Chemin temporaire:', tempPath);
      console.log('Chemin cible:', targetPath);
  
      // Créer le répertoire de l'utilisateur s'il n'existe pas
      await fs.ensureDir(targetDir);
  
      // Déplacer le fichier du répertoire temporaire vers le répertoire de l'utilisateur
      await fs.move(tempPath, targetPath, { overwrite: true });
  
      console.log('Fichier déplacé avec succès');
  
      // Utilisez le chemin relatif pour le stockage en base de données
      const photoUrl = `/uploads/${userId}/${req.file.originalname}`;
      console.log('Photo de profil mise à jour nom:', photoUrl);
      const updatedPhoto = await Profil.updatePhoto(userId, photoUrl);
      
      // Renvoyez l'URL complète pour l'affichage côté client
      const fullPhotoUrl = `http://localhost:3001/src${photoUrl}`;
      res.json({ success: true, message: 'Photo de profil mise à jour', photoUrl: fullPhotoUrl, originalName: req.file.originalname });
    } catch (error) {
      console.error('Erreur détaillée:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
  });
  
  router.post('/check-file-exists', async (req, res) => {
      console.log('Requête reçue dans check-file-exists:', req.body);
      const { fileName } = req.body;
      const filePath = path.join('uploads', fileName);
  
      try {
          const fileExists = await fs.pathExists(filePath);
          res.json({ exists: fileExists });
      } catch (error) {
          console.error('Erreur lors de la vérification du fichier:', error);
          res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
      }
  });
  
  router.post('/update-profile-photo', async (req, res) => {
      const { userId, photoName } = req.body;
    
      try {
          // Vérifier si l'utilisateur a déjà une collection de photos
          let result = await pool.query('SELECT photo_collection_id FROM users WHERE id = $1', [userId]);
          let collectionId = result.rows[0]?.photo_collection_id;
  
          // Si non, créer une nouvelle collection
          if (!collectionId) {
              result = await pool.query('INSERT INTO photo_collections (user_id) VALUES ($1) RETURNING id', [userId]);
              collectionId = result.rows[0].id;
              await pool.query('UPDATE users SET photo_collection_id = $1 WHERE id = $2', [collectionId, userId]);
          }
  
          // Dsactiver l'ancienne photo de profil
          await pool.query(`
              UPDATE photos 
              SET is_active = FALSE 
              WHERE collection_id = $1 AND type_id = (SELECT id FROM photo_types WHERE name = 'profile')
          `, [collectionId]);
  
          // Insérer la nouvelle photo
          result = await pool.query(`
              INSERT INTO photos (collection_id, type_id, url, is_active) 
              VALUES ($1, (SELECT id FROM photo_types WHERE name = 'profile'), $2, TRUE)
              RETURNING url
          `, [collectionId, `/uploads/${userId}/${photoName}`]);
  
          const newPhotoUrl = result.rows[0].url;
  
          res.json({ success: true, message: 'Photo de profil mise à jour avec succès', photoUrl: newPhotoUrl });
      } catch (error) {
          console.error('Erreur lors de la mise à jour de la photo de profil:', error);
          res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la photo de profil' });
      }
  });
  
  router.get('/profile-photos/:userId', async (req, res) => {
      try {
          const userId = req.params.userId;
          console.log('userId:', userId);
          if (!userId) {
              return res.status(400).json({ success: false, message: 'ID utilisateur manquant' });
          }
          
          const uploadsDir = path.join(__dirname, `../../../src/uploads/${userId}/`);
          console.log('uploadsDir:', uploadsDir);
          
          // Vérifiez si le répertoire existe
          if (!await fs.pathExists(uploadsDir)) {
              console.log('uploadsDir n\'existe pas');
              return res.json({ success: true, photos: [] });
          }
          
          const files = await fs.readdir(uploadsDir);
          console.log('files:', files);
          const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
          console.log('imageFiles:', imageFiles);
          res.json({ success: true, photos: imageFiles });
      } catch (error) {
          console.error('Erreur lors de la récupération des photos de profil:', error);
          res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
      }
  });
  
  router.get('/user-profile/:userId', async (req, res) => {
      try {
          console.log('in user-profile:', req.params.userId);
          const userId = parseInt(req.params.userId, 10);
          if (isNaN(userId)) {
              return res.status(400).json({ success: false, message: 'ID utilisateur invalide' });
          }
          const userProfile = await Profil.getProfil(userId);
          
          if (userProfile) {
              console.log('Photo URL renvoyée:', userProfile.photo_url);
              res.json({ 
                  success: true, 
                  profile: {
                      id: userProfile.id,
                      user_name: userProfile.user_name,
                      email: userProfile.email,
                      photo_url: userProfile.photo_url
                  }
              });
          } else {
              res.status(404).json({ success: false, message: 'Profil utilisateur non trouvé' });
          }
      } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
          res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
      }
  });
  
  module.exports = router;
