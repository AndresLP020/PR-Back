// Serverless handler for /api/scheduledAssignments
import { getScheduledAssignments } from '../services/scheduledAssignmentsService';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const assignments = await getScheduledAssignments();
      res.status(200).json(assignments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
