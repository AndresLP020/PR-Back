// Serverless handler for /api/upload
import { uploadFile } from '../controllers/uploadController';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await uploadFile(req, res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
