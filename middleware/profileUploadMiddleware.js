import multer from 'multer';
import { uploadConfig } from '../config/upload.js';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/perfiles');
  },
  filename: (req, file, cb) => {
    // Usar el número de control como parte del nombre del archivo
    const numeroControl = req.body.numeroControl || 'temp';
    const uniqueSuffix = Date.now();
    cb(null, `${numeroControl}_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Solo permitir imágenes
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

export const uploadProfile = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo para fotos de perfil
  },
  fileFilter: fileFilter
}).single('fotoPerfil'); // nombre del campo para la foto de perfil
