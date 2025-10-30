import cloudinary from '../config/cloudinary.js';

export async function uploadFile(req, res) {
  try {
    // Supón que recibes el archivo como base64 en req.body.file
    const { file } = req.body;
    if (!file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }
    const result = await cloudinary.uploader.upload(file, {
      folder: 'docentes',
    });
    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
