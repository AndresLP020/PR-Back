// Serverless handler for /api/notifications
import { sendNotification } from '../services/notificationService';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await sendNotification(req, res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
