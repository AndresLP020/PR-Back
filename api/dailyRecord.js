// Serverless handler for /api/dailyRecord
import { getDailyRecords } from '../controllers/dailyRecordController';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const records = await getDailyRecords();
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
