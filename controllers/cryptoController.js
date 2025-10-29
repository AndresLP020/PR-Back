import crypto from 'crypto';
import { getPublicKey, getPrivateKey } from '../config/keys.js';
import { createSession, getSessionKey } from '../services/sessionStore.js';

export const getPubKey = (req, res) => {
  try {
    const pub = getPublicKey();
    return res.type('text/plain').send(pub);
  } catch (err) {
    console.error('Error getPubKey:', err);
    return res.status(500).json({ error: 'internal' });
  }
};

export const createSessionHandler = (req, res) => {
  try {
    const { encryptedKey } = req.body; // base64
    if (!encryptedKey) return res.status(400).json({ error: 'missing encryptedKey' });

    const encryptedBuf = Buffer.from(encryptedKey, 'base64');
    const privKey = getPrivateKey();
    const aesKey = crypto.privateDecrypt(
      { key: privKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
      encryptedBuf
    ); // Buffer of bytes (32 bytes for AES-256)

    const sessionId = crypto.randomBytes(16).toString('hex');
    createSession(sessionId, aesKey);

    console.log('createSessionHandler: new session created', sessionId);
    return res.json({ sessionId });
  } catch (err) {
    console.error('Error createSessionHandler:', err);
    return res.status(400).json({ error: 'invalid encryptedKey' });
  }
};

export const secureEndpoint = (req, res) => {
  try {
    const { sessionId } = req.params;
    const key = getSessionKey(sessionId);
    if (!key) return res.status(401).json({ error: 'invalid session' });

    const { iv, ciphertext, aad } = req.body;
    if (!iv || !ciphertext) return res.status(400).json({ error: 'missing fields' });

    const ivBuf = Buffer.from(iv, 'base64');
    const ctBuf = Buffer.from(ciphertext, 'base64');

    if (ctBuf.length < 16) return res.status(400).json({ error: 'malformed ciphertext' });
    const tag = ctBuf.slice(ctBuf.length - 16);
    const encrypted = ctBuf.slice(0, ctBuf.length - 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, ivBuf);
    if (aad) decipher.setAAD(Buffer.from(aad, 'base64'));
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    const msg = decrypted.toString('utf8');

    // aquí procesas msg; ejemplo: echo
    const responseText = JSON.stringify({ ok: true, got: msg });

    // cifrar respuesta
    const outIv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, outIv);
    const outEnc = Buffer.concat([cipher.update(responseText, 'utf8'), cipher.final()]);
    const outTag = cipher.getAuthTag();
    const outCt = Buffer.concat([outEnc, outTag]);
    return res.json({ iv: outIv.toString('base64'), ciphertext: outCt.toString('base64') });
  } catch (err) {
    console.error('Error secureEndpoint:', err);
    return res.status(500).json({ error: 'decryption failed' });
  }
};
