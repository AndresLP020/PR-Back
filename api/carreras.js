// Serverless handler for /api/carreras
import { getCarreras } from '../controllers/carrerasController';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const carreras = await getCarreras();
      res.status(200).json(carreras);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
