// Serverless handler for /api/users
import { getUsers } from '../controllers/userController';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const users = await getUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
