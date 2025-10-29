import express from 'express';
import { getPubKey, createSessionHandler, secureEndpoint } from '../controllers/cryptoController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
router.get('/pubkey', getPubKey);
// Protegemos la creación de sesión con auth opcional — puedes decidir quitar auth if needed
router.post('/session', auth, createSessionHandler);
router.post('/secure/:sessionId', auth, secureEndpoint);

export default router;
