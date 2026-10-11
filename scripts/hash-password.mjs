#!/usr/bin/env node
// Generates the value for the ADMIN_PASSWORD_HASH environment variable.
//
//   node scripts/hash-password.mjs                # prompts for the password (input hidden)
//   node scripts/hash-password.mjs --secret       # also prints a fresh ADMIN_SESSION_SECRET
//
// Output format: scrypt:N:r:p:saltB64:hashB64
// The password itself is never written anywhere. Paste the printed value into
// Netlify > Site configuration > Environment variables (mark it "secret").
import { randomBytes, scrypt as scryptCb } from 'node:crypto';
import { stdin, stdout, stderr, argv, exit } from 'node:process';

const N = 2 ** 15;
const r = 8;
const p = 1;
const KEY_LEN = 32;

function scrypt(password, salt) {
  return new Promise((resolve, reject) =>
    scryptCb(password, salt, KEY_LEN, { N, r, p, maxmem: 256 * N * r + 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
}

function readHidden(prompt) {
  return new Promise((resolve, reject) => {
    if (!stdin.isTTY) {
      // Piped input: read the first line.
      let data = '';
      stdin.setEncoding('utf8');
      stdin.on('data', (chunk) => (data += chunk));
      stdin.on('end', () => resolve(data.split(/\r?\n/)[0]));
      stdin.on('error', reject);
      return;
    }
    stderr.write(prompt);
    let value = '';
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    const onData = (ch) => {
      for (const c of ch) {
        if (c === '\r' || c === '\n') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off('data', onData);
          stderr.write('\n');
          resolve(value);
          return;
        }
        if (c === '\u0003') {
          stderr.write('\n');
          exit(130);
        }
        if (c === '\u007f' || c === '\b') value = value.slice(0, -1);
        else value += c;
      }
    };
    stdin.on('data', onData);
  });
}

const password = await readHidden('Admin password: ');
if (!password || password.length < 12) {
  stderr.write('Use a password of at least 12 characters.\n');
  exit(1);
}
if (stdin.isTTY) {
  const again = await readHidden('Repeat password: ');
  if (again !== password) {
    stderr.write('Passwords do not match.\n');
    exit(1);
  }
}

const salt = randomBytes(16);
const hash = await scrypt(password.normalize('NFKC'), salt);
stdout.write(`ADMIN_PASSWORD_HASH=scrypt:${N}:${r}:${p}:${salt.toString('base64')}:${hash.toString('base64')}\n`);
if (argv.includes('--secret')) {
  stdout.write(`ADMIN_SESSION_SECRET=${randomBytes(48).toString('base64url')}\n`);
}
