// Serverless handler for /api/stats
import { getStats } from '../controllers/statsController';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const stats = await getStats();
      res.status(200).json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
