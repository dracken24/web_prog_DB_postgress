const authRoutes = require('./routes/auth.cjs');
const emailRoutes = require('./routes/email.cjs');
const photosRoutes = require('./routes/photos.cjs');

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/photos', photosRoutes);

// Servir les fichiers statiques du dossier 'uploads'
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
// // Servir les fichiers statiques du dossier uploads
// app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

