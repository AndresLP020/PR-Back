// Serverless handler for /api/assignments
import { getAssignments } from '../controllers/assignmentController';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const assignments = await getAssignments();
      res.status(200).json(assignments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
