import { readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const testsDir = path.join(rootDir, 'tests');
const integrationTests = new Set(['smoke.test.mjs', 'diagnosis-categories.test.mjs']);

const files = (await readdir(testsDir))
  .filter((name) => name.endsWith('.test.mjs') && !integrationTests.has(name))
  .sort()
  .map((name) => path.join('tests', name));

if (files.length === 0) {
  console.error('No unit test files found.');
  process.exit(1);
}

const child = spawn(process.execPath, ['--test', ...files], {
  cwd: rootDir,
  env: process.env,
  stdio: 'inherit',
});

child.on('error', (error) => {
  console.error('Unable to start unit tests:', error);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Unit tests stopped by signal ${signal}.`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
