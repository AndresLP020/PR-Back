// Serverless handler for /api/bulk
import { bulkAction } from '../controllers/bulkActions';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await bulkAction(req, res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
