import { SignJWT, jwtVerify } from 'jose';

const getSecretKey = (env) => {
  const secret = env?.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required. Set it in .dev.vars (local) or Wrangler Dashboard (production).');
  }
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

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(left, right) {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  if (a.byteLength !== b.byteLength) return false;

  let result = 0;
  for (let i = 0; i < a.byteLength; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

export function needsPasswordRehash(storedHash) {
  return Boolean(storedHash) && !storedHash.includes(':');
}

export async function verifyPassword(password, storedHash) {
  if (!storedHash) return false;

  if (!storedHash.includes(':')) {
    if (constantTimeEqual(password, storedHash)) {
      return true;
    }

    if (/^[a-f0-9]{64}$/i.test(storedHash)) {
      const passwordHash = await sha256Hex(password);
      return constantTimeEqual(passwordHash, storedHash.toLowerCase());
    }

    return false;
  }

  const [saltHex, originalHash] = storedHash.split(':');
  if (!saltHex || !originalHash) return false;

  const saltBytes = saltHex.match(/.{1,2}/g);
  if (!saltBytes) return false;

  // Convert salt from Hex to Uint8Array
  const salt = new Uint8Array(saltBytes.map((byte) => parseInt(byte, 16)));

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
  const hashHex = Array.from(new Uint8Array(exportedKey)).map((byte) => byte.toString(16).padStart(2, '0')).join('');

  return constantTimeEqual(hashHex, originalHash);
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
