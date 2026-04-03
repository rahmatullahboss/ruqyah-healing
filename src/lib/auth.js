import { SignJWT, jwtVerify } from 'jose';

// Define a simple fallback secret for local dev if env not setup
// Always use a strong JWT_SECRET in production (.dev.vars or Wrangler Dashboard)
const getSecretKey = (env) => {
  const secret = env.JWT_SECRET || 'super-secret-local-development-key';
  return new TextEncoder().encode(secret);
};

// Web Crypto PBKDF2 password hashing
export async function hashPassword(password) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const exportedKey = await crypto.subtle.exportKey('raw', key);
  
  // Convert ArrayBuffers to Hex string
  const hashHex = Array.from(new Uint8Array(exportedKey)).map(b => b.toString(16).padStart(2, '0')).join('');
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Format: salt:hash
  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  
  const [saltHex, originalHash] = storedHash.split(':');
  
  // Convert salt from Hex to Uint8Array
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const exportedKey = await crypto.subtle.exportKey('raw', key);
  const hashHex = Array.from(new Uint8Array(exportedKey)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex === originalHash;
}

export async function createSession(userId, env) {
  const secret = getSecretKey(env);
  const jwt = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 days session
    .sign(secret);
    
  return jwt;
}

export async function verifySession(token, env) {
  try {
    const secret = getSecretKey(env);
    const { payload } = await jwtVerify(token, secret);
    return payload.userId;
  } catch (error) {
    return null; // Invalid token or expired
  }
}
