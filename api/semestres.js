// Serverless handler for /api/semestres
import { getSemestres } from '../controllers/semestreController';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const semestres = await getSemestres();
      res.status(200).json(semestres);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
