import path from 'path';
import fs from 'fs';

// Crear directorio de uploads si no existe
const createUploadDirs = () => {  const dirs = [
    'uploads',
    'uploads/evidencias',
    'uploads/perfiles'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      // Establecer permisos 755 para Linux/Mac (no afecta a Windows)
      fs.chmodSync(dir, 0o755);
    }
  });
};

export const uploadConfig = {
  createUploadDirs,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo por archivo
    files: 10 // máximo 10 archivos por subida
  },
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/mpeg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
};
