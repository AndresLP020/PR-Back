import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const keyDir = path.join(process.cwd(), 'keys');
const pubPath = path.join(keyDir, 'server_pub.pem');
const privPath = path.join(keyDir, 'server_priv.pem');

export function ensureKeys() {
  if (!fs.existsSync(keyDir)) fs.mkdirSync(keyDir, { recursive: true });
  if (!fs.existsSync(pubPath) || !fs.existsSync(privPath)) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 3072,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    fs.writeFileSync(pubPath, publicKey);
    fs.writeFileSync(privPath, privateKey, { mode: 0o600 });
  }
}

export function getPublicKey() {
  ensureKeys();
  return fs.readFileSync(pubPath, 'utf8');
}

export function getPrivateKey() {
  ensureKeys();
  return fs.readFileSync(privPath, 'utf8');
}
