// Serverless handler for /api/auth
import { login, register } from '../controllers/userController';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Aquí puedes diferenciar entre login y register según el body o la ruta
    if (req.body && req.body.type === 'login') {
      return login(req, res);
    } else if (req.body && req.body.type === 'register') {
      return register(req, res);
    }
    res.status(400).json({ error: 'Tipo de autenticación no especificado' });
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}
