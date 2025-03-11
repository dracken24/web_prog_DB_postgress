const { pool } = require('../config.cjs');

class Profil {
  static async getProfil(userId) {
    const result = await pool.query(`
      SELECT u.*, p.url AS photo_url 
      FROM users u 
      LEFT JOIN photo_collections pc ON u.photo_collection_id = pc.id
      LEFT JOIN photos p ON pc.id = p.collection_id AND p.type_id = (SELECT id FROM photo_types WHERE name = 'profile')
      WHERE u.id = $1 AND p.is_active = TRUE
    `, [userId]);
    return result.rows[0];
  }

  static async updatePhoto(userId, photoUrl) {
    console.log('Dans updatePhoto - userId:', userId, 'photoUrl:', photoUrl);
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

      // Désactiver l'ancienne photo de profil
      await pool.query(`
        UPDATE photos 
        SET is_active = FALSE 
        WHERE collection_id = $1 AND type_id = (SELECT id FROM photo_types WHERE name = 'profile')
      `, [collectionId]);

      // Insérer la nouvelle photo
      result = await pool.query(`
        INSERT INTO photos (collection_id, type_id, url, is_active) 
        VALUES ($1, (SELECT id FROM photo_types WHERE name = 'profile'), $2, TRUE)
        RETURNING *
      `, [collectionId, photoUrl]);

      console.log('Nouvelle photo ajoutée:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la photo:', error);
      throw error;
    }
  }
}

module.exports = Profil;