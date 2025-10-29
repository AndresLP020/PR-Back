// Serverless handler for /api/email
import { sendEmail } from '../services/emailService';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await sendEmail(req, res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
